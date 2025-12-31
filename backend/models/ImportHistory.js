const mongoose = require('mongoose');

const importHistorySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    importType: {
        type: String,
        enum: ['GOOGLE_HEALTH', 'MANUAL_UPLOAD', 'API_SYNC', 'AI_EXTRACTED'],
        required: true
    },
    sourceProvider: {
        type: String,
        enum: ['GOOGLE_HEALTH', 'APPLE_HEALTH', 'FITBIT', 'MANUAL', 'AI_VAULT'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL'],
        default: 'PENDING'
    },
    dataImported: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    recordsProcessed: {
        type: Number,
        default: 0
    },
    recordsSuccessful: {
        type: Number,
        default: 0
    },
    recordsFailed: {
        type: Number,
        default: 0
    },
    errorDetails: [String],
    aiAnalysis: {
        detectedConditions: [String],
        riskFactors: [String],
        recommendations: [String],
        confidence: Number
    },
    syncedDataFields: [String],
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    duration: Number, // in milliseconds
    retryCount: {
        type: Number,
        default: 0
    },
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('ImportHistory', importHistorySchema);
