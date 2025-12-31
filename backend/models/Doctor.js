const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        enum: ['Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Psychiatry', 'General Medicine', 'Surgery', 'Oncology', 'Gastroenterology'],
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    qualifications: [String], // e.g., ['MBBS', 'MD', 'PhD']
    experience: Number, // Years of experience
    hospital: String,
    department: String,
    consultationFee: Number,
    bio: String,
    availability: {
        monday: { start: String, end: String }, // "09:00" format
        tuesday: { start: String, end: String },
        wednesday: { start: String, end: String },
        thursday: { start: String, end: String },
        friday: { start: String, end: String },
        saturday: { start: String, end: String },
        sunday: { start: String, end: String }
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalConsultations: {
        type: Number,
        default: 0
    },
    profilePictureUrl: String,
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
