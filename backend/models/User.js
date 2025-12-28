const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        select: false
    },
    fullName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['PATIENT', 'DOCTOR', 'ADMIN'],
        default: 'PATIENT'
    },
    googleId: {
        type: String
    },
    phone: String,
    gender: String,
    lastLoginAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
