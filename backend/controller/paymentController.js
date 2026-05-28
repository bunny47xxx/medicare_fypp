const crypto = require('crypto');
const axios = require('axios');
const { Appointment, User, DoctorProfile } = require('../model/associations');

const MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
const SECRET_KEY  = process.env.ESEWA_SECRET_KEY  || '8gBm/:&EnhH.1/q';
const API_URL     = process.env.ESEWA_API_URL     || 'https://rc.esewa.com.np/api/epay';
const SUCCESS_URL = process.env.ESEWA_SUCCESS_URL || 'http://localhost:5173/payment/verify';
const FAILURE_URL = process.env.ESEWA_FAILURE_URL || 'http://localhost:5173/payment/verify';

// HMAC-SHA256 — same as PaymentGatewayService.generateEsewaSignature
function generateSignature({ total_amount, transaction_uuid, product_code }) {
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(message).digest('base64');
}

// POST /api/payment/initiate  (patient auth required)
const initiatePayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findOne({
      where: { id: appointmentId, patientId: req.user.id },
      include: [
        {
          model: User, as: 'doctor', attributes: ['id', 'fullName'],
          include: [{ model: DoctorProfile, as: 'profile', attributes: ['consultationFee'] }],
        },
      ],
    });

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.paymentStatus === 'paid') return res.status(400).json({ error: 'Already paid' });
    if (!['confirmed', 'rescheduled'].includes(appointment.status)) {
      return res.status(400).json({ error: 'Payment is only allowed after the doctor confirms your appointment.' });
    }

    const amount      = parseFloat(appointment.doctor?.profile?.consultationFee || 100);
    const totalAmount = amount; // no tax / service / delivery charges
    const transactionUuid = `APT-${appointmentId}-${Date.now()}`;

    const signature = generateSignature({
      total_amount:     totalAmount.toString(),
      transaction_uuid: transactionUuid,
      product_code:     MERCHANT_ID,
    });

    // Persist transaction id
    await appointment.update({ esewaTransactionId: transactionUuid, paymentAmount: amount });

    // Return form_data exactly like PaymentGatewayService.initiateEsewaPayment
    res.json({
      success: true,
      gateway: 'esewa',
      payment_url: `${API_URL}/main/v2/form`,
      form_data: {
        amount:                   amount.toString(),
        tax_amount:               '0',
        total_amount:             totalAmount.toString(),
        transaction_uuid:         transactionUuid,
        product_code:             MERCHANT_ID,
        product_service_charge:   '0',
        product_delivery_charge:  '0',
        success_url:              SUCCESS_URL,
        failure_url:              FAILURE_URL,
        signed_field_names:       'total_amount,transaction_uuid,product_code',
        signature,
      },
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

// GET /api/payment/verify?data=<base64>  (eSewa redirect — no auth)
const verifyPayment = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.status(400).json({ error: 'Missing payment data' });

    // eSewa returns base64-encoded JSON
    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    const {
      transaction_uuid,
      transaction_code,
      status,
      total_amount,
      signed_field_names,
      signature: receivedSig,
    } = decoded;

    // Verify signature integrity
    const fields  = signed_field_names.split(',');
    const message = fields.map(f => `${f}=${decoded[f]}`).join(',');
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(message).digest('base64');

    if (expectedSig !== receivedSig) {
      return res.status(400).json({ success: false, error: 'Signature mismatch' });
    }

    if (status !== 'COMPLETE') {
      return res.json({ success: false, status, message: 'Payment not completed' });
    }

    // Cross-check with eSewa status API (same as verifyEsewaPayment)
    try {
      const statusRes = await axios.get(`${API_URL}/transaction/status/`, {
        params: {
          product_code:     MERCHANT_ID,
          total_amount:     total_amount,
          transaction_uuid: transaction_uuid,
        },
      });
      if (statusRes.data.status !== 'COMPLETE') {
        return res.json({ success: false, status: statusRes.data.status, message: 'Payment not confirmed by eSewa' });
      }
    } catch (e) {
      console.warn('eSewa status check failed, trusting redirect data:', e.message);
    }

    const appointment = await Appointment.findOne({ where: { esewaTransactionId: transaction_uuid } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    await appointment.update({
      paymentStatus: 'paid',
      esewaRefId:    transaction_code,
      status:        'confirmed', // already confirmed, keep it
    });

    res.json({
      success: true,
      appointmentId: appointment.id,
      message: 'Payment verified. Appointment confirmed.',
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

module.exports = { initiatePayment, verifyPayment };
