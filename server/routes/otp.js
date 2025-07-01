// routes/otp.js
import express from 'express';
import twilio from 'twilio';

console.log('⚙️  OTP Route loaded with env:');
console.log('  TWILIO_SID:', process.env.TWILIO_SID);
console.log('  TWILIO_AUTH_TOKEN:', !!process.env.TWILIO_AUTH_TOKEN);
console.log('  TWILIO_VERIFY_SERVICE_SID:', process.env.TWILIO_VERIFY_SERVICE_SID);

const router = express.Router();
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send OTP
router.post('/send', async (req, res) => {
  const { phone } = req.body;
  console.log('📨 /otp/send called with:', phone);
  if (!phone) return res.status(400).json({ message: 'Phone is required' });

  try {
    const verification = await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: 'sms'
      });
    console.log('✅ Twilio verification response:', verification);
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('❌ Twilio send error:', err);
    // Send back the raw error message for now
    res.status(500).json({ message: err.message || 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  const { phone, otp } = req.body;
  console.log('🔍 /otp/verify called with:', phone, otp);
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

  try {
    const check = await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phone,
        code: otp
      });
    console.log('✅ Twilio verify response:', check);
    res.json({ valid: check.status === 'approved' });
  } catch (err) {
    console.error('❌ Twilio verify error:', err);
    res.status(500).json({ message: err.message || 'Failed to verify OTP' });
  }
});

export default router;
