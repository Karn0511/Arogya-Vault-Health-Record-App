const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'PRESCRIPTION_READY', 'REPORT_AVAILABLE', 'VACCINATION_DUE', 'APPOINTMENT_COMPLETION', 'MESSAGE', 'GENERAL'],
        required: true
    },
    title: String,
    message: {
        type: String,
        required: true
    },
    relatedId: {
        appointmentId: mongoose.Schema.Types.ObjectId,
        reportId: mongoose.Schema.Types.ObjectId,
        prescriptionId: mongoose.Schema.Types.ObjectId
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    actions: [
        {
            label: String,
            url: String
        }
    ],
    expiresAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
