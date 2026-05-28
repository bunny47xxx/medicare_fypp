const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { authenticateToken, requirePatient, requireDoctor } = require('../middleware/auth');
const { LabReport } = require('../model/associations');

const router = express.Router();

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../uploads/lab-reports');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|jpg|jpeg|png)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only PDF, JPG, PNG files are allowed'));
  },
});

// POST /api/lab-reports  — patient uploads
router.post('/', authenticateToken, requirePatient, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { title, description, appointmentId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const report = await LabReport.create({
      patientId:     req.user.id,
      appointmentId: appointmentId || null,
      title,
      description:   description || null,
      fileName:      req.file.originalname,
      filePath:      req.file.filename,
      fileType:      req.file.mimetype,
      fileSize:      req.file.size,
    });

    res.status(201).json({ message: 'Lab report uploaded', report });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload lab report: ' + err.message });
  }
});

// GET /api/lab-reports  — patient fetches own reports
router.get('/', authenticateToken, requirePatient, async (req, res) => {
  try {
    const reports = await LabReport.findAll({
      where: { patientId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lab reports' });
  }
});

// GET /api/lab-reports/patient/:patientId  — doctor views patient reports for a specific appointment
router.get('/patient/:patientId', authenticateToken, requireDoctor, async (req, res) => {
  try {
    const { appointmentId } = req.query;
    const where = { patientId: req.params.patientId };
    if (appointmentId) where.appointmentId = appointmentId;

    const reports = await LabReport.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lab reports' });
  }
});

// GET /api/lab-reports/file/:filename  — serve file (public, filename is UUID-based)
router.get('/file/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(filePath);
});

// DELETE /api/lab-reports/:id  — patient deletes own report
router.delete('/:id', authenticateToken, requirePatient, async (req, res) => {
  try {
    const report = await LabReport.findOne({ where: { id: req.params.id, patientId: req.user.id } });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const filePath = path.join(uploadDir, report.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await report.destroy();
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

module.exports = router;
