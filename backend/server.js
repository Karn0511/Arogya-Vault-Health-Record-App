require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ========== PASSWORD VERIFICATION FUNCTION ==========
const verifyPassword = (storedPassword, plainPassword) => {
    if (!storedPassword || !storedPassword.includes(':')) {
        // Direct comparison for passwords that haven't been hashed
        return storedPassword === plainPassword;
    }
    // For hashed passwords (salt:hash format)
    const [salt, hash] = storedPassword.split(':');
    const testHash = crypto.pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512').toString('hex');
    return hash === testHash;
};

// ========== ENVIRONMENT VARIABLES ==========
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/arogya?authSource=admin';
const JWT_SECRET = process.env.JWT_SECRET || 'arogya_vault_super_secret_key_2025';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';

// ========== DATABASE MODELS ==========
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const MedicalReport = require('./models/MedicalReport');
const Medicine = require('./models/Medicine');
const Prescription = require('./models/Prescription');
const PatientHealth = require('./models/PatientHealth');
const Vaccination = require('./models/Vaccination');
const Notification = require('./models/Notification');
const ApprovalRequest = require('./models/ApprovalRequest');
const ImportHistory = require('./models/ImportHistory');
const FileStorage = require('./models/FileStorage');

// ========== ROUTES ==========
const adminRoutes = require('./routes/admin');

// ========== SERVICES ==========
const geminiService = require('./services/gemini-ai.service');

// ========== ADVANCED FEATURES ROUTES ==========
const {
    importFromGoogleVault,
    getImportHistory,
    getImportDetails,
    uploadFile,
    getPatientFiles,
    deleteFile,
    submitApproval,
    getPendingApprovals,
    approveRequest,
    rejectRequest
} = require('./routes/advancedFeatures');

// ========== EXPRESS SETUP ==========
const app = express();

// Middleware
const allowedOrigins = CORS_ORIGIN.split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in Docker for internal communication
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========== ERROR HANDLER MIDDLEWARE ==========
const errorHandler = (err, req, res, _next) => {
    console.error('❌ Error:', err.message);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format',
            message: err.message
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            error: 'Duplicate Field',
            message: `${Object.keys(err.keyPattern)[0]} already exists`
        });
    }

    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    });
};

// ========== MONGODB CONNECTION ==========
let mongoMemoryServer;
let DB_CONNECTED = false;

// ========== STATUS HELPERS ==========
const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes)) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
};

async function getHealthSnapshot() {
    let stats = {};
    let dbError = null;

    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 3000)
    );

    try {
        const statsPromise = Promise.all([
            User.countDocuments(),
            Doctor.countDocuments(),
            Appointment.countDocuments(),
            MedicalReport.countDocuments(),
            Prescription.countDocuments(),
            PatientHealth.countDocuments()
        ]);

        const [users, doctors, appointments, reports, prescriptions, healthRecords] = await Promise.race([
            statsPromise,
            timeout
        ]);

        stats = { users, doctors, appointments, reports, prescriptions, healthRecords };
    } catch (err) {
        dbError = err.message;
        stats = { error: 'Database not reachable' };
    }

    const mem = process.memoryUsage();

    return {
        status: 'ok',
        message: 'Arogya Backend with MongoDB',
        version: '2.0.0',
        environment: NODE_ENV,
        port: PORT,
        dbConnected: DB_CONNECTED,
        dbUri: MONGO_URI,
        dbError,
        collections: 16,
        endpoints: 60,
        stats,
        uptimeSeconds: process.uptime(),
        uptimeHuman: formatDuration(process.uptime()),
        memory: {
            rss: formatBytes(mem.rss),
            heapUsed: formatBytes(mem.heapUsed),
            external: formatBytes(mem.external)
        },
        features: [
            'Auth (JWT + OTP)',
            'Appointments and doctor profiles',
            'Medical reports and prescriptions',
            'ABDM-ready patient health timeline',
            'File storage and approvals',
            'Admin dashboard and notifications'
        ],
        timestamp: new Date().toISOString()
    };
}

async function connectToMongo() {
    try {
        console.log('⏳ Connecting to MongoDB at ' + MONGO_URI);

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 60000,
            connectTimeoutMS: 60000,
            socketTimeoutMS: 60000,
            retryWrites: true,
            retryReads: true,
            maxPoolSize: 10,
            minPoolSize: 2
        });

        // Verify connection
        const adminDB = mongoose.connection.db.admin();
        await adminDB.ping();
        DB_CONNECTED = true;
        console.log('✅ MongoDB connected successfully');

    } catch (err) {
        console.error('❌ MongoDB Error:', err.message);
        console.error('⚠️  Troubleshooting:');
        console.error('   1. Check if MongoDB is running on ' + MONGO_URI);
        console.error('   2. Verify network connectivity: ping 172.24.76.116');
        console.error('   3. Check firewall allows port 27017');
        console.error('   4. Verify MongoDB credentials (admin:admin123)');
        console.error('   5. Check MongoDB bind IP allows remote connections');

        // Continue without database for now instead of exiting
        DB_CONNECTED = false;
        console.error('⚠️  Running without database - read-only mode');
    }
}

// ========== DATABASE READY ==========
// Database is pre-seeded with seed-fixed.js script
// No automatic seeding on startup - use: node database/seed-fixed.js

// ========== HEALTH CHECK ==========
app.get('/', (req, res) => {
    res.json({
        status: '✅ Arogya Vault Backend Running!',
        version: '2.0.0',
        environment: NODE_ENV,
        collections: 13,
        endpoints: 50
    });
});

app.get('/health', async (req, res) => {
        const snapshot = await getHealthSnapshot();
        res.json(snapshot);
});

app.get('/status', async (req, res) => {
        const snapshot = await getHealthSnapshot();
        const wantsJson = req.query.format === 'json' || req.accepts(['html', 'json']) === 'json';

        if (wantsJson) {
                return res.json(snapshot);
        }

        const statusColor = snapshot.dbConnected ? '#10b981' : '#ef4444';

        const html = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Arogya Backend Status</title>
    <style>
        :root { color-scheme: light dark; }
        body { margin: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #fff7ed, #ecfeff); color: #0f172a; }
        .page { max-width: 1200px; margin: 32px auto; padding: 0 20px; }
        .hero { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
        .hero h1 { margin: 0; font-size: 32px; letter-spacing: -0.02em; }
        .badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 12px; background: #f97316; color: white; font-weight: 700; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 20px; }
        .card { background: rgba(255,255,255,0.9); border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); backdrop-filter: blur(6px); }
        .card h3 { margin: 0 0 8px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
        .value { font-size: 22px; font-weight: 800; color: #0f172a; }
        .muted { color: #64748b; font-size: 14px; }
        .list { margin: 8px 0 0; padding-left: 18px; color: #0f172a; }
        pre { background: #0f172a; color: #e2e8f0; border-radius: 12px; padding: 12px; overflow: auto; font-size: 13px; }
    </style>
</head>
<body>
    <div class="page">
        <div class="hero">
            <div>
                <div class="badge">Arogya Backend</div>
                <h1>System Control Panel</h1>
                <p class="muted">Version ${snapshot.version} · ${snapshot.environment} · Port ${snapshot.port}</p>
            </div>
            <div class="card" style="min-width:240px; border-color:${statusColor};">
                <h3>Database</h3>
                <div class="value" style="color:${statusColor};">${snapshot.dbConnected ? 'Connected' : 'Not Connected'}</div>
                <p class="muted">${snapshot.dbUri}</p>
                ${snapshot.dbError ? `<p class="muted" style="color:#ef4444;">${snapshot.dbError}</p>` : ''}
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>Service</h3>
                <div class="value">${snapshot.message}</div>
                <p class="muted">Uptime ${snapshot.uptimeHuman}</p>
            </div>

            <div class="card">
                <h3>API Surface</h3>
                <div class="value">${snapshot.endpoints} endpoints</div>
                <p class="muted">${snapshot.collections} collections ready</p>
            </div>

            <div class="card">
                <h3>Usage</h3>
                <div class="value">${snapshot.memory.heapUsed} heap</div>
                <p class="muted">RSS ${snapshot.memory.rss} · External ${snapshot.memory.external}</p>
            </div>

            <div class="card">
                <h3>Core Stats</h3>
                <p class="muted">Users ${snapshot.stats.users ?? '–'} · Doctors ${snapshot.stats.doctors ?? '–'}</p>
                <p class="muted">Appointments ${snapshot.stats.appointments ?? '–'} · Reports ${snapshot.stats.reports ?? '–'}</p>
                <p class="muted">Prescriptions ${snapshot.stats.prescriptions ?? '–'} · Health ${snapshot.stats.healthRecords ?? '–'}</p>
            </div>
        </div>

        <div class="card" style="margin-top:20px;">
            <h3>Main Flows</h3>
            <ul class="list">
                <li>Patient and doctor onboarding with JWT/OTP auth</li>
                <li>Appointments, prescriptions, and health records lifecycle</li>
                <li>Advanced file imports, approvals, and storage</li>
                <li>Notifications and admin oversight with activity logs</li>
            </ul>
        </div>

        <div class="grid" style="margin-top:12px;">
            <div class="card">
                <h3>Features</h3>
                <ul class="list">${snapshot.features.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
            <div class="card">
                <h3>Raw Payload</h3>
                <pre>${JSON.stringify(snapshot, null, 2)}</pre>
            </div>
        </div>
    </div>
</body>
</html>`;

        res.type('html').send(html);
});

// ========== AUTH MIDDLEWARE ==========
const checkAuth = require('./middleware/auth');

// ========== ADMIN ROUTES ==========
app.use('/api/admin', adminRoutes);

// ========== AUTH ENDPOINTS ==========
app.post('/api/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !verifyPassword(user.password, password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

        res.json({
            token,
            user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role }
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/auth/me', checkAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userData.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                phone: user.phone,
                gender: user.gender
            }
        });
    } catch (error) {
        next(error);
    }
});

// ========== OTP STORAGE (In-memory for demo, use Redis/DB in production) ==========
const otpSessions = new Map();

// Generate random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
app.post('/api/auth/send-otp', async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Validate phone format (10 digits)
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ error: 'Invalid phone format' });
        }

        // Generate session ID
        const sessionId = require('crypto').randomBytes(16).toString('hex');
        const otp = generateOTP();

        // Store session (in production, use Redis with expiration)
        otpSessions.set(sessionId, {
            phone,
            otp,
            attempts: 0,
            createdAt: Date.now(),
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
        console.log(`📱 OTP for ${phone}: ${otp}`);

        res.json({
            sessionId,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Verify OTP and Login
app.post('/api/auth/verify-otp', async (req, res, next) => {
    try {
        const { phone, otp, sessionId } = req.body;

        if (!phone || !otp || !sessionId) {
            return res.status(400).json({ error: 'Phone, OTP, and session ID are required' });
        }

        // Get session
        const session = otpSessions.get(sessionId);
        if (!session) {
            return res.status(400).json({ error: 'Invalid or expired session' });
        }

        // Check expiration
        if (session.expiresAt < Date.now()) {
            otpSessions.delete(sessionId);
            return res.status(400).json({ error: 'OTP expired. Request a new one.' });
        }

        // Check attempts
        if (session.attempts >= 3) {
            otpSessions.delete(sessionId);
            return res.status(400).json({ error: 'Too many failed attempts. Request a new OTP.' });
        }

        // Verify OTP
        if (session.otp !== otp) {
            session.attempts++;
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        // Find or create user
        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({
                phone,
                fullName: 'User', // Can be updated later
                email: `phone_${phone}@arogya.local`,
                role: 'PATIENT',
                verified: true
            });
            await user.save();
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Update last login
        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

        // Clean up session
        otpSessions.delete(sessionId);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// Register endpoint (Email/Password signup)
app.post('/api/auth/register', async (req, res, next) => {
    try {
        const { fullName, email, phone, password, role = 'PATIENT' } = req.body;

        // Validation
        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({
                error: 'All fields (fullName, email, phone, password) are required'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.email === email.toLowerCase()
                    ? 'Email already registered'
                    : 'Phone number already registered'
            });
        }

        // Create new user
        const user = new User({
            fullName,
            email: email.toLowerCase(),
            phone,
            password, // In production, hash this with bcrypt!
            role: role || 'PATIENT',
            verified: true
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// Verify OTP and Signup
app.post('/api/auth/verify-otp-signup', async (req, res, next) => {
    try {
        const { phone, otp, sessionId } = req.body;

        if (!phone || !otp || !sessionId) {
            return res.status(400).json({ error: 'Phone, OTP, and session ID are required' });
        }

        // Get session
        const session = otpSessions.get(sessionId);
        if (!session) {
            return res.status(400).json({ error: 'Invalid or expired session' });
        }

        // Check expiration
        if (session.expiresAt < Date.now()) {
            otpSessions.delete(sessionId);
            return res.status(400).json({ error: 'OTP expired. Request a new one.' });
        }

        // Check attempts
        if (session.attempts >= 3) {
            otpSessions.delete(sessionId);
            return res.status(400).json({ error: 'Too many failed attempts. Request a new OTP.' });
        }

        // Verify OTP
        if (session.otp !== otp) {
            session.attempts++;
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        // Check if user already exists
        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({
                phone,
                fullName: `User_${phone.slice(-4)}`,
                email: `phone_${phone}_${Date.now()}@arogya.local`,
                role: 'PATIENT',
                verified: true
            });
            await user.save();
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Update last login
        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

        // Clean up session
        otpSessions.delete(sessionId);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// Google Sign-In endpoint
app.post('/api/auth/google', async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Google token is required' });
        }

        // Verify token with Google API
        let googleUser;
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to verify Google token');
            }

            const payload = await response.json();
            googleUser = {
                email: payload.email,
                fullName: payload.name || payload.email.split('@')[0],
                googleId: payload.sub,
                picture: payload.picture
            };
        } catch (error) {
            console.error('Google token verification failed:', error);
            return res.status(401).json({ error: 'Invalid Google token' });
        }

        let user = await User.findOne({ email: googleUser.email });
        if (!user) {
            user = new User({
                email: googleUser.email,
                fullName: googleUser.fullName,
                role: 'PATIENT',
                verified: true,
                profilePicture: googleUser.picture
            });
            await user.save();
        } else {
            // Update profile picture if changed
            if (googleUser.picture && user.profilePicture !== googleUser.picture) {
                await User.updateOne({ _id: user._id }, { profilePicture: googleUser.picture });
            }
        }

        const jwtToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// ========== DOCTOR ENDPOINTS ==========
app.get('/api/doctors', async (req, res, next) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'fullName email phone');
        res.json(doctors);
    } catch (error) {
        next(error);
    }
});

app.get('/api/doctors/:id', async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('userId');
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (error) {
        next(error);
    }
});

// ========== APPOINTMENT ENDPOINTS ==========
app.get('/api/appointments', checkAuth, async (req, res, next) => {
    try {
        const appointments = await Appointment.find({ patientId: req.userData.id })
            .populate('doctorId')
            .sort({ appointmentDate: -1 });
        res.json(appointments);
    } catch (error) {
        next(error);
    }
});

app.post('/api/appointments', checkAuth, async (req, res, next) => {
    try {
        const appointment = await Appointment.create({
            patientId: req.userData.id,
            ...req.body,
            status: 'SCHEDULED'
        });

        await Notification.create({
            userId: req.userData.id,
            type: 'APPOINTMENT_CONFIRMED',
            title: 'Appointment Booked',
            message: 'Your appointment has been confirmed',
            priority: 'HIGH'
        });

        res.status(201).json(appointment);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/appointments/:id', checkAuth, async (req, res, next) => {
    try {
        await Appointment.findByIdAndUpdate(req.params.id, { status: 'CANCELLED' });
        res.json({ message: 'Appointment cancelled' });
    } catch (error) {
        next(error);
    }
});

// ========== MEDICAL REPORTS ==========
app.get('/api/medical-reports', checkAuth, async (req, res, next) => {
    try {
        const reports = await MedicalReport.find({ patientId: req.userData.id }).sort({ testDate: -1 });
        res.json(reports);
    } catch (error) {
        next(error);
    }
});

app.post('/api/medical-reports', checkAuth, async (req, res, next) => {
    try {
        const report = await MedicalReport.create({
            patientId: req.userData.id,
            ...req.body,
            testDate: new Date(),
            severity: 'LOW'
        });
        res.status(201).json(report);
    } catch (error) {
        next(error);
    }
});

// ========== MEDICINES ==========
app.get('/api/medicines', async (req, res, next) => {
    try {
        const { category, search } = req.query;
        let query = {};
        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };

        const medicines = await Medicine.find(query).limit(100);
        res.json(medicines);
    } catch (error) {
        next(error);
    }
});

// ========== PRESCRIPTIONS ==========
app.get('/api/prescriptions', checkAuth, async (req, res, next) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.userData.id })
            .populate('medicines.medicineId')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error) {
        next(error);
    }
});

// ========== PATIENT HEALTH ==========
app.get('/api/patient-health', checkAuth, async (req, res, next) => {
    try {
        const health = await PatientHealth.findOne({ patientId: req.userData.id });
        if (!health) return res.status(404).json({ message: 'Health profile not found' });
        res.json(health);
    } catch (error) {
        next(error);
    }
});

app.post('/api/patient-health', checkAuth, async (req, res, next) => {
    try {
        let health = await PatientHealth.findOne({ patientId: req.userData.id });
        if (!health) {
            health = await PatientHealth.create({ patientId: req.userData.id, ...req.body });
        } else {
            Object.assign(health, req.body);
            await health.save();
        }
        res.json(health);
    } catch (error) {
        next(error);
    }
});

app.post('/api/patient-health/vitals', checkAuth, async (req, res, next) => {
    try {
        let health = await PatientHealth.findOne({ patientId: req.userData.id });
        if (!health) {
            health = await PatientHealth.create({ patientId: req.userData.id });
        }
        health.vitals.push({ ...req.body, recordedAt: new Date() });
        await health.save();
        res.status(201).json(health);
    } catch (error) {
        next(error);
    }
});

// ========== VACCINATIONS ==========
app.get('/api/vaccinations', checkAuth, async (req, res, next) => {
    try {
        const vaccinations = await Vaccination.find({ patientId: req.userData.id }).sort({ vaccinationDate: -1 });
        res.json(vaccinations);
    } catch (error) {
        next(error);
    }
});

app.post('/api/vaccinations', checkAuth, async (req, res, next) => {
    try {
        const vaccination = await Vaccination.create({
            patientId: req.userData.id,
            ...req.body,
            vaccinationDate: new Date(),
            status: 'COMPLETED'
        });
        res.status(201).json(vaccination);
    } catch (error) {
        next(error);
    }
});

// ========== NOTIFICATIONS ==========
app.get('/api/notifications', checkAuth, async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.userData.id }).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

app.put('/api/notifications/:id', checkAuth, async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        next(error);
    }
});

// ========== ADVANCED FEATURES: GOOGLE API & AI IMPORTS ==========
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,png,pdf,doc,docx').split(',');
        const ext = path.extname(file.originalname).substring(1);
        if (allowedTypes.includes(ext)) cb(null, true);
        else cb(new Error(`File type .${ext} not allowed`));
    }
});

// Google Vault AI Import
app.post('/api/ai-imports/google-vault', checkAuth, async (req, res, next) => {
    try {
        const { googleAccessToken, syncType = 'FULL' } = req.body;
        if (!googleAccessToken) return res.status(400).json({ error: 'Google token required' });

        const importRecord = new ImportHistory({
            patientId: req.userData.id,
            importType: 'GOOGLE_HEALTH',
            sourceProvider: 'GOOGLE_HEALTH',
            status: 'IN_PROGRESS',
            syncType,
            createdBy: req.userData.id
        });
        await importRecord.save();

        setTimeout(async () => {
            try {
                // Mock data simulation for Google Health API import
                // const mockData = {
                //     vitals: [
                //         { temperature: 37.2, bloodPressure: '120/80', heartRate: 72, date: new Date() }
                //     ],
                //     medications: [
                //         { name: 'Aspirin', dosage: '500mg', frequency: 'daily' }
                //     ]
                // };

                const aiAnalysis = {
                    detectedConditions: ['Good health'],
                    riskFactors: [],
                    recommendations: ['Continue current routine', 'Monitor vitals'],
                    confidenceScore: 0.95
                };

                importRecord.status = 'COMPLETED';
                importRecord.dataImported = { vitalsCount: 1, medicationsCount: 1 };
                importRecord.aiAnalysis = aiAnalysis;
                importRecord.completedAt = new Date();
                await importRecord.save();

                const notification = new Notification({
                    userId: req.userData.id,
                    type: 'IMPORT_COMPLETED',
                    title: 'Google Health Import Complete',
                    message: 'Your health data has been successfully imported',
                    isRead: false
                });
                await notification.save();
            } catch (err) {
                importRecord.status = 'FAILED';
                importRecord.errorMessage = err.message;
                await importRecord.save();
            }
        }, 2000);

        res.json({ importId: importRecord._id, status: 'PROCESSING', message: 'Import started' });
    } catch (error) {
        next(error);
    }
});

// Get Import History
app.get('/api/ai-imports/history', checkAuth, async (req, res, next) => {
    try {
        const history = await ImportHistory.find({ patientId: req.userData.id }).sort({ createdAt: -1 }).limit(20);
        res.json(history);
    } catch (error) {
        next(error);
    }
});

// Get Import Status
app.get('/api/ai-imports/:importId', checkAuth, async (req, res, next) => {
    try {
        const importRecord = await ImportHistory.findById(req.params.importId);
        if (!importRecord) return res.status(404).json({ error: 'Import not found' });
        res.json(importRecord);
    } catch (error) {
        next(error);
    }
});

// ========== GEMINI AI ENDPOINTS ==========

// Symptom Checker - Analyze symptoms and provide health advice
app.post('/api/ai/symptom-checker', checkAuth, async (req, res) => {
    try {
        const { symptoms, patientData } = req.body;

        if (!symptoms || !symptoms.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Symptoms description is required'
            });
        }

        // Get user data for context
        const user = await User.findById(req.userData.id);
        const patientHealth = await PatientHealth.findOne({ patientId: req.userData.id });

        const contextData = {
            age: patientData?.age || 'Unknown',
            gender: user?.gender || 'Unknown',
            medicalHistory: patientData?.medicalHistory || '',
            currentMedications: patientData?.currentMedications || '',
            vitals: patientHealth ? {
                bloodPressure: patientHealth.bloodPressure,
                heartRate: patientHealth.heartRate,
                temperature: patientHealth.temperature
            } : {}
        };

        const advice = await geminiService.getHealthAdvice(symptoms, contextData);

        res.json({
            success: true,
            advice: advice.advice || advice.response,
            recommendations: advice.recommendations || [],
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Symptom checker error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze symptoms',
            message: error.message
        });
    }
});

// Health Report Analysis
app.post('/api/ai/analyze-report', checkAuth, async (req, res) => {
    try {
        const { reportData, patientContext } = req.body;

        if (!reportData) {
            return res.status(400).json({
                success: false,
                error: 'Report data is required'
            });
        }

        const analysis = await geminiService.analyzeHealthReport(reportData, patientContext);

        res.json({
            success: true,
            analysis: analysis.analysis,
            recommendations: analysis.recommendations || [],
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Report analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze report',
            message: error.message
        });
    }
});

// Image Analysis (Gemini Vision)
app.post('/api/ai/analyze-image', checkAuth, async (req, res) => {
    try {
        const { imageData, documentType } = req.body;

        if (!imageData) {
            return res.status(400).json({
                success: false,
                error: 'Image data is required'
            });
        }

        const analysis = await geminiService.analyzeImageDocument(imageData, documentType || 'Medical Document');

        res.json({
            success: true,
            analysis: analysis.analysis || analysis,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Image analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze image',
            message: error.message
        });
    }
});

// AI Chat for Health Queries
app.post('/api/ai/chat', checkAuth, async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const response = await geminiService.chat(message, context || {});

        res.json({
            success: true,
            response: response.response,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get AI response',
            message: error.message
        });
    }
});

// Medication Interaction Check
app.post('/api/ai/check-interactions', checkAuth, async (req, res) => {
    try {
        const { medications } = req.body;

        if (!medications || !Array.isArray(medications) || medications.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Medications array is required'
            });
        }

        const interactions = await geminiService.getMedicationInteractions(medications);

        res.json({
            success: true,
            interactions: interactions.interactions || [],
            warnings: interactions.warnings || [],
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Medication interaction check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check interactions',
            message: error.message
        });
    }
});

// File Upload with MongoDB GridFS
app.post('/api/files/upload', checkAuth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const fileDoc = new FileStorage({
            userId: req.userData.id,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            filePath: req.file.path,
            fileType: path.extname(req.file.originalname),
            uploadedAt: new Date()
        });
        await fileDoc.save();

        res.json({
            fileId: fileDoc._id,
            fileName: fileDoc.fileName,
            fileSize: fileDoc.fileSize,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Get User Files
app.get('/api/files', checkAuth, async (req, res, next) => {
    try {
        const files = await FileStorage.find({ userId: req.userData.id }).sort({ uploadedAt: -1 }).limit(50);
        res.json(files);
    } catch (error) {
        next(error);
    }
});

// Delete File
app.delete('/api/files/:fileId', checkAuth, async (req, res, next) => {
    try {
        const file = await FileStorage.findById(req.params.fileId);
        if (!file) return res.status(404).json({ error: 'File not found' });
        if (file.userId.toString() !== req.userData.id) return res.status(403).json({ error: 'Unauthorized' });

        if (fs.existsSync(file.filePath)) fs.unlinkSync(file.filePath);
        await FileStorage.findByIdAndDelete(req.params.fileId);

        res.json({ message: 'File deleted' });
    } catch (error) {
        next(error);
    }
});

// Approval Requests
app.post('/api/approvals/request', checkAuth, async (req, res, next) => {
    try {
        const { title, description, requestType } = req.body;
        const approval = new ApprovalRequest({
            requesterId: req.userData.id,
            requestType,
            title,
            description,
            status: 'PENDING',
            submittedAt: new Date()
        });
        await approval.save();
        res.json({ approvalId: approval._id, status: 'PENDING' });
    } catch (error) {
        next(error);
    }
});

// Get Approvals (for admin)
app.get('/api/approvals', checkAuth, async (req, res, next) => {
    try {
        if (req.userData.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
        const approvals = await ApprovalRequest.find().populate('requesterId', 'fullName email').sort({ submittedAt: -1 });
        res.json(approvals);
    } catch (error) {
        next(error);
    }
});

// Approve/Reject
app.put('/api/approvals/:approvalId', checkAuth, async (req, res, next) => {
    try {
        if (req.userData.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
        const { status, remarks } = req.body;
        const approval = await ApprovalRequest.findByIdAndUpdate(
            req.params.approvalId,
            { status, remarks, reviewedBy: req.userData.id, reviewedAt: new Date() },
            { new: true }
        );
        res.json(approval);
    } catch (error) {
        next(error);
    }
});

// Admin Dashboard
app.get('/api/admin/dashboard', checkAuth, async (req, res, next) => {
    try {
        if (req.userData.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

        const stats = {
            totalPatients: await User.countDocuments({ role: 'PATIENT' }),
            totalDoctors: await Doctor.countDocuments(),
            totalAppointments: await Appointment.countDocuments(),
            totalReports: await MedicalReport.countDocuments(),
            pendingApprovals: await ApprovalRequest.countDocuments({ status: 'PENDING' }),
            completedImports: await ImportHistory.countDocuments({ status: 'COMPLETED' }),
            totalFiles: await FileStorage.countDocuments()
        };

        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Real-time Notifications WebSocket Ready (placeholder for WebSocket implementation)
app.post('/api/notifications/subscribe', checkAuth, async (req, res) => {
    res.json({ message: 'WebSocket subscription ready', userId: req.userData.id });
});

// ========== ADVANCED FEATURES INITIALIZATION ==========
// Initialize all advanced feature routes
importFromGoogleVault(app, checkAuth);
getImportHistory(app, checkAuth);
getImportDetails(app, checkAuth);
uploadFile(app, checkAuth, upload);  // Pass the multer upload instance
getPatientFiles(app, checkAuth);
deleteFile(app, checkAuth);
submitApproval(app, checkAuth);
getPendingApprovals(app, checkAuth);
approveRequest(app, checkAuth);
rejectRequest(app, checkAuth);

// ========== ERROR HANDLER ==========
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// ========== STARTUP ==========
async function start() {
    // Start server immediately
    app.listen(PORT, () => {
        console.log(`🚀 Arogya Vault v2.0 running on http://localhost:${PORT}`);
        console.log(`⏳ Connecting to database...`);
    });

    // Connect to MongoDB in background
    try {
        await connectToMongo();
        if (DB_CONNECTED) {
            console.log(`✅ Database connected - using pre-seeded data (run: node database/seed-fixed.js if needed)`);
        }
    } catch (err) {
        console.error('❌ DB connection failed:', err.message);
        console.log(`⚠️  Server running in NO-DB mode`);
    }
}

start();

// Graceful shutdown
process.on('SIGINT', async () => {
    if (mongoMemoryServer) await mongoMemoryServer.stop();
    await mongoose.connection.close();
    process.exit(0);
});
