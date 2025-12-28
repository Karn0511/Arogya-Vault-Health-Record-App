const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['LOGIN', 'LOGOUT', 'VIEW_RECORD', 'DOWNLOAD_RECORD', 'SHARE_RECORD', 'CREATE_APPOINTMENT', 'CANCEL_APPOINTMENT', 'UPDATE_PROFILE', 'UPLOAD_REPORT'],
        required: true
    },
    resourceType: String, // e.g., 'MedicalReport', 'Prescription'
    resourceId: mongoose.Schema.Types.ObjectId,
    resourceName: String,
    ipAddress: String,
    userAgent: String,
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'UNAUTHORIZED'],
        default: 'SUCCESS'
    },
    description: String
}, {
    timestamps: true
});

module.exports = mongoose.model('AccessLog', accessLogSchema);
