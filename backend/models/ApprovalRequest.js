const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestType: {
        type: String,
        enum: ['USER_REGISTRATION', 'DOCTOR_REGISTRATION', 'PROFILE_UPDATE', 'DOCUMENT_UPLOAD'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    requestData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: String,
    comments: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    approvedAt: Date,
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
