const mongoose = require('mongoose');

const healthRecordsSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recordType: {
        type: String,
        enum: ['PRESCRIPTION', 'MEDICAL_REPORT', 'VACCINATION', 'LAB_TEST', 'DISCHARGE_SUMMARY', 'PATHOLOGY', 'RADIOLOGY', 'CONSULTATION_NOTE'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    content: String, // Text content
    attachments: [
        {
            fileName: String,
            fileUrl: String,
            fileType: String,
            uploadedAt: Date
        }
    ],
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    recordDate: Date,
    isConfidential: {
        type: Boolean,
        default: false
    },
    accessLog: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            accessedAt: Date,
            action: String // 'VIEW', 'DOWNLOAD', 'SHARE'
        }
    ],
    tags: [String],
    archiveStatus: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HealthRecords', healthRecordsSchema);
