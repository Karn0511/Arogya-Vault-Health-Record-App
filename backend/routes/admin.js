const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const AccessLog = require('../models/AccessLog');

// Middleware to optionally check auth (don't require it, just use it if provided)
const optionalAuth = (req, res, next) => {
  // Routes can proceed with or without auth
  next();
};

router.use(optionalAuth);

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const activeAppointments = await Appointment.countDocuments({ status: 'SCHEDULED' });
    const pendingApprovals = await Doctor.countDocuments({ verified: false });

    res.json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      totalMedicines,
      activeAppointments,
      pendingApprovals
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    // Validate user ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    // Validate status
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (ACTIVE, INACTIVE, or SUSPENDED)' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

router.put('/users/:id/suspend', async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'SUSPENDED', suspendReason: reason },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error suspending user', error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Doctor Management
router.get('/doctors', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const doctors = await Doctor.find()
      .populate('userId', 'fullName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments();

    const formattedDoctors = doctors.map(doc => ({
      id: doc._id,
      fullName: doc.userId?.fullName || 'Unknown',
      email: doc.userId?.email || 'N/A',
      specialization: doc.specialization,
      license: doc.licenseNumber,
      rating: doc.rating || 0,
      verified: doc.verified,
      status: doc.userId?.status || 'INACTIVE'
    }));

    res.json({ doctors: formattedDoctors, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

router.put('/doctors/:id/verify', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying doctor', error: error.message });
  }
});

router.put('/doctors/:id/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error approving doctor', error: error.message });
  }
});

router.put('/doctors/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await User.findByIdAndUpdate(doctor.userId, { status });

    res.json({ message: 'Doctor status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor status', error: error.message });
  }
});

// Medicine Management
router.get('/medicines', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const medicines = await Medicine.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Medicine.countDocuments();

    res.json({ medicines, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicines', error: error.message });
  }
});

router.post('/medicines', async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Error creating medicine', error: error.message });
  }
});

router.put('/medicines/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Error updating medicine', error: error.message });
  }
});

router.delete('/medicines/:id', async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medicine', error: error.message });
  }
});

// Analytics
router.get('/analytics/user-growth', async (req, res) => {
  try {
    const total = await User.countDocuments();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({ total, newThisMonth });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user growth', error: error.message });
  }
});

router.get('/analytics/appointments', async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const completed = await Appointment.countDocuments({ status: 'COMPLETED' });
    const cancelled = await Appointment.countDocuments({ status: 'CANCELLED' });

    res.json({ total, completed, cancelled });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment stats', error: error.message });
  }
});

router.get('/analytics/revenue', async (req, res) => {
  try {
    // Placeholder - implement based on your payment model
    res.json({ total: 150000, thisMonth: 25000 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue stats', error: error.message });
  }
});

// Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await AccessLog.find()
      .populate('userId', 'fullName email')
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 });

    const total = await AccessLog.countDocuments();

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

module.exports = router;
