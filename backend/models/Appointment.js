const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true // "09:00-09:30"
    },
    reason: String,
    symptoms: String,
    status: {
        type: String,
        enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'],
        default: 'SCHEDULED'
    },
    consultationType: {
        type: String,
        enum: ['ONLINE', 'IN_PERSON'],
        default: 'ONLINE'
    },
    notes: String,
    prescription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    },
    diagnosis: String,
    medicalReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalReport'
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        submittedAt: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
