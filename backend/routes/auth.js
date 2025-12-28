
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Settings from '../models/Settings.js';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const router = express.Router();

// Helper to generate a random secure password
const generateRandomPassword = (length = 10) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const settings = await Settings.findOne();
    if (!settings) {
        return res.status(404).json({ message: 'Admin account not configured' });
    }

    if (email.toLowerCase() === settings.adminEmail.toLowerCase() && (await bcrypt.compare(password, settings.adminPassword))) {
      res.json({
        token: jwt.sign({ id: settings._id }, process.env.JWT_SECRET, { expiresIn: '1d' }),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Reset admin access with a random password and notify via email
// @route   POST /api/auth/reset-access
// @access  Public
router.post('/reset-access', async (req, res) => {
    const { email } = req.body;
    const systemEmail = process.env.GMAIL_USER;
    const systemPass = process.env.GMAIL_PASS;

    try {
        const settings = await Settings.findOne();
        if (!settings) return res.status(404).json({ message: 'System not initialized' });

        const inputEmail = email.toLowerCase();
        const storedAdminEmail = settings.adminEmail.toLowerCase();
        const masterEmail = systemEmail ? systemEmail.toLowerCase() : null;

        // Security logic: Allow if matches stored admin email OR the master system email (Vercel Key)
        if (inputEmail !== storedAdminEmail && inputEmail !== masterEmail) {
            return res.status(403).json({ message: 'Access Denied: Email mismatch' });
        }

        // Generate a fresh random password for this specific request
        const dynamicPass = generateRandomPassword(12);
        const salt = await bcrypt.genSalt(10);
        settings.adminPassword = await bcrypt.hash(dynamicPass, salt);
        
        // If master email was used to reset, also update the admin email in DB to match
        if (inputEmail === masterEmail) {
            settings.adminEmail = systemEmail;
        }
        
        await settings.save();

        // Notify admin via email with the dynamic password
        if (systemEmail && systemPass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: systemEmail, pass: systemPass }
            });

            const mailOptions = {
                from: `"SAZO Security" <${systemEmail}>`,
                to: inputEmail,
                subject: '🚨 Emergency Access Reset: New Admin Credentials',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; max-width: 500px; margin: auto; background-color: #fff;">
                        <div style="text-align: center; margin-bottom: 25px;">
                             <h1 style="color: #db2777; margin: 0; font-size: 32px; letter-spacing: -1px;">SAZO</h1>
                             <p style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Security Desk</p>
                        </div>
                        <div style="padding: 20px; background-color: #fff1f2; border-radius: 10px; border: 1px solid #fecdd3; margin-bottom: 20px;">
                            <h2 style="color: #9d174d; font-size: 18px; margin-top: 0;">Access Reset Successful</h2>
                            <p style="color: #be185d; font-size: 14px; line-height: 1.5;">Your admin password has been automatically generated and updated in the system as requested.</p>
                        </div>
                        
                        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Your Temporary Password:</p>
                            <div style="background: #ffffff; padding: 15px; border: 2px dashed #db2777; font-size: 22px; color: #db2777; font-weight: bold; letter-spacing: 1px; font-family: monospace;">
                                ${dynamicPass}
                            </div>
                        </div>

                        <p style="color: #475569; font-size: 13px; line-height: 1.6;">
                            <strong>Next Steps:</strong><br>
                            1. Log in to the admin panel using this temporary password.<br>
                            2. Immediately go to <b>Settings > Security</b> to create a new password of your choice.<br>
                            3. Never share these credentials with anyone.
                        </p>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
                            Sent by SAZO Automated Security Service. If you did not request this, please contact support immediately.
                        </div>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
        }

        res.json({ message: 'Password reset successful. Check your email for the new credentials.' });
    } catch (error) {
        console.error('Reset Error:', error);
        res.status(500).json({ message: 'Internal Server Error during reset' });
    }
});

export default router;
