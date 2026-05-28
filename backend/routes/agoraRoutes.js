const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/agora/token?channel=apt_123
router.get('/token', authenticateToken, (req, res) => {
  const { channel } = req.query;
  if (!channel) return res.status(400).json({ error: 'channel is required' });

  const appId          = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  // If no certificate configured, return app-id only (testing mode)
  if (!appCertificate || appCertificate === 'your_agora_app_certificate') {
    return res.json({ token: null, appId, channel, uid: req.user.id });
  }

  const uid        = 0; // 0 = Agora assigns a unique UID automatically
  const role       = RtcRole.PUBLISHER;
  const expireTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId, appCertificate, channel, uid, role, expireTime
  );

  res.json({ token, appId, channel, uid });
});

module.exports = router;
