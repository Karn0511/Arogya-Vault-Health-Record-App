const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const phoneEmailService = require('../services/phone-email-otp.service'); // Added service import

// Helper to generate JWT
const signToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Password Hashing Helper
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

// OTP Sessions (In-Memory)
const otpSessions = new Map();

// Generate random 6-digit OTP
const generateOTP = () => {
    try {
        return Math.floor(100000 + Math.random() * 900000).toString();
    } catch (e) {
        return "123456"; // Fallback
    }
};

// =========================================================================
// REGISTER (Email/Password)
// =========================================================================
router.post('/register', async (req, res, next) => {
    try {
        const { fullName, email, phone, password, role } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const newUser = new User({
            fullName,
            email: email.toLowerCase(),
            phone,
            password: hashPassword(password),
            role: role || 'PATIENT',
            verified: false
        });

        await newUser.save();
        await newUser.save();
        const token = signToken(newUser);

        // Audit Log
        const AccessLog = require('../models/AccessLog');
        await AccessLog.create({
            userId: newUser._id,
            action: 'LOGIN',
            resourceType: 'SYSTEM',
            details: { method: 'REGISTER', email: email },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            status: 'SUCCESS'
        });

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: newUser._id, email: newUser.email, fullName: newUser.fullName, role: newUser.role }
        });
    } catch (err) {
        next(err);
    }
});

// =========================================================================
// LOGIN (Local Strategy)
// =========================================================================
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info ? info.message : 'Login failed' });
        }

        const token = signToken(user);
        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

        // Audit Log
        const AccessLog = require('../models/AccessLog');
        await AccessLog.create({
            userId: user._id,
            action: 'LOGIN',
            resourceType: 'SYSTEM',
            details: { method: 'PASSWORD' },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            status: 'SUCCESS'
        });

        return res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role }
        });
    })(req, res, next);
});

// =========================================================================
// GOOGLE AUTH
// =========================================================================
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_failed' }),
    (req, res) => {
        const token = signToken(req.user);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        res.redirect(`${frontendUrl}/auth/success?token=${token}`);
    }
);

// Mobile Google Sign-In (Token Exchange)
router.post('/google', async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Google token is required' });

        // In a real app, verify the token. Simplified for consistency with existing server.js flow
        // Assuming the passport GoogleStrategy handles the web flow, this handles the mobile/client-side flow
        // Ideally, use google-auth-library here. For now, we reuse the pattern from old server.js
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to verify Google token');

        const payload = await response.json();

        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = new User({
                email: payload.email,
                fullName: payload.name,
                googleId: payload.sub,
                profilePicture: payload.picture,
                role: 'PATIENT',
                verified: true
            });
            await user.save();
        } else {
            // Update existing user with fresh Google data
            if (payload.name && user.fullName === 'User') user.fullName = payload.name; // Only override if placeholder, or force update? Let's forced update if available
            if (payload.name) user.fullName = payload.name;
            if (payload.picture) user.profilePicture = payload.picture;
            if (payload.sub) user.googleId = payload.sub;
            await user.save();
        }

        const jwtToken = signToken(user);
        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

        // Audit Log
        const AccessLog = require('../models/AccessLog');
        await AccessLog.create({
            userId: user._id,
            action: 'LOGIN',
            resourceType: 'SYSTEM',
            details: { method: 'GOOGLE' },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            status: 'SUCCESS'
        });

        res.json({ token: jwtToken, user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        next(error);
    }
});

// =========================================================================
// OTP AUTH
// =========================================================================
router.post('/send-otp', async (req, res, next) => {
    try {
        const { phone, countryCode = '+91' } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone number required' });

        const cleanPhone = phone.replace(/\D/g, '');

        // External Provider
        if (phoneEmailService && phoneEmailService.isConfigured) {
            const result = await phoneEmailService.sendOTP(cleanPhone, countryCode);
            const sessionId = result.sessionId || `ext_${Date.now()}`;
            otpSessions.set(sessionId, {
                phone: cleanPhone,
                attempts: 0,
                expiresAt: Date.now() + 600000
            });
            return res.json({ sessionId, message: result.message || 'OTP sent via provider' });
        }

        // Mock Fallback
        const sessionId = crypto.randomBytes(16).toString('hex');
        const otp = generateOTP();
        otpSessions.set(sessionId, {
            phone: cleanPhone,
            otp,
            attempts: 0,
            expiresAt: Date.now() + 600000
        });

        console.log(`📱 OTP for ${cleanPhone}: ${otp}`);
        res.json({ sessionId, message: 'OTP sent (mock)' });
    } catch (err) {
        next(err);
    }
});

router.post('/verify-otp', async (req, res, next) => {
    try {
        const { phone, otp, sessionId, countryCode = '+91', name } = req.body;
        if (!phone || !otp || !sessionId) return res.status(400).json({ error: 'Missing fields' });

        const session = otpSessions.get(sessionId);

        // 1. Validate Session Existence
        if (!session) return res.status(400).json({ error: 'Invalid or Expired Session' });
        if (session.expiresAt < Date.now()) {
            otpSessions.delete(sessionId);
            return res.status(400).json({ error: 'Session Expired' });
        }

        // 2. Verify OTP (External vs Internal)
        let isVerified = false;

        if (phoneEmailService && phoneEmailService.isConfigured && !session.otp) {
            // External Provider Verification
            const result = await phoneEmailService.verifyOTP(phone, otp, sessionId, countryCode);
            if (result.success) {
                isVerified = true;
            } else {
                return res.status(401).json({ error: result.message || 'Invalid OTP' });
            }
        } else {
            // Internal Mock Verification
            if (session.otp === otp) {
                isVerified = true;
            } else {
                return res.status(401).json({ error: 'Invalid OTP' });
            }
        }

        if (!isVerified) return res.status(401).json({ error: 'OTP Verification Failed' });

        // 3. Find or Create User
        // Check both direct phone match or email match used for phone (if any)
        const cleanPhone = phone.replace(/\D/g, '');
        let user = await User.findOne({ phone: cleanPhone });

        if (!user) {
            // Check if there is a generic user with this phone (unlikely format but good to check)
            // Create New User
            user = new User({
                phone: cleanPhone,
                fullName: name || 'User',
                email: `phone_${cleanPhone}@arogya.local`, // Place holder email
                role: 'PATIENT',
                verified: true
            });
            await user.save();
        }

        // 4. Generate Token & Respond
        const token = signToken(user);
        otpSessions.delete(sessionId);

        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

        // Audit Log
        const AccessLog = require('../models/AccessLog');
        await AccessLog.create({
            userId: user._id,
            action: 'LOGIN',
            resourceType: 'SYSTEM',
            details: { method: 'OTP', phone: cleanPhone },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            status: 'SUCCESS'
        });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
});

// =========================================================================
// CURRENT USER
// =========================================================================
const checkAuth = require('../middleware/auth');
router.get('/me', checkAuth, async (req, res) => {
    const user = await User.findById(req.userData.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            phone: user.phone,
            profilePicture: user.profilePicture
        }
    });
});

module.exports = router;
