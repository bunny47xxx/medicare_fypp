import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = 'http://localhost:5000/api';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setStatus('failed');
      setMessage('No payment data received.');
      return;
    }

    axios.get(`${API_BASE}/payment/verify?data=${encodeURIComponent(data)}`)
      .then(res => {
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.message || 'Payment successful. Appointment confirmed!');
        } else {
          setStatus('failed');
          setMessage(res.data.message || 'Payment was not completed.');
        }
      })
      .catch(err => {
        setStatus('failed');
        setMessage(err.response?.data?.error || 'Payment verification failed.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-cyan-600 animate-spin" />
            <h2 className="text-xl font-bold text-[#344256]">Verifying Payment...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-bold text-green-700">Payment Successful!</h2>
            <p className="text-gray-600 mt-2">{message}</p>

            {/* Video call coming soon banner */}
            <div className="mt-6 bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-left flex items-start gap-3">
              <span className="text-2xl">🎥</span>
              <div>
                <p className="font-semibold text-cyan-800">Online Video Consultation</p>
                <p className="text-sm text-cyan-700 mt-0.5">
                  Video call consultation is <span className="font-bold">coming soon</span>. Your doctor will contact you to arrange the consultation.
                </p>
                <span className="inline-block mt-2 text-xs bg-cyan-100 text-cyan-700 border border-cyan-300 rounded-full px-3 py-0.5 font-medium">
                  Coming Soon
                </span>
              </div>
            </div>

            <Button className="mt-5 bg-cyan-600 hover:bg-cyan-700 w-full" onClick={() => navigate('/user')}>
              Go to Dashboard
            </Button>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-red-700">Payment Failed</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <Button className="mt-6 bg-cyan-600 hover:bg-cyan-700 w-full" onClick={() => navigate('/user')}>
              Back to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
