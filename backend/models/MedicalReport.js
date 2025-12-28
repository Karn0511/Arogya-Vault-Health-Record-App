const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportType: {
        type: String,
        enum: ['BLOOD_TEST', 'X_RAY', 'MRI', 'CT_SCAN', 'ULTRASOUND', 'ECG', 'EEG', 'OTHER'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    imageUrl: [String], // Array of image URLs
    fileUrl: String, // PDF or document URL
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    hospitalName: String,
    labName: String,
    testDate: Date,
    results: {
        findings: String,
        normalRange: String,
        patientValue: String,
        status: {
            type: String,
            enum: ['NORMAL', 'ABNORMAL', 'PENDING']
        }
    },
    recommendations: String,
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW'
    },
    isShared: {
        type: Boolean,
        default: false
    },
    sharedWith: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            sharedAt: Date,
            accessLevel: { type: String, enum: ['VIEW', 'EDIT'] }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
