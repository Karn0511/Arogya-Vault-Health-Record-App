const mongoose = require('mongoose');

const fileStorageSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: String,
    fileType: {
        type: String,
        enum: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'gif', 'txt', 'other'],
        required: true
    },
    mimeType: String,
    fileSize: {
        type: Number,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    s3Key: String, // For AWS S3 storage
    fileCategory: {
        type: String,
        enum: ['MEDICAL_REPORT', 'PRESCRIPTION', 'LAB_RESULT', 'INSURANCE', 'PERSONAL', 'OTHER'],
        default: 'OTHER'
    },
    relatedAppointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    relatedReportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalReport'
    },
    description: String,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    accessibleTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [String],
    metadata: {
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        lastAccessedAt: Date,
        accessCount: {
            type: Number,
            default: 0
        },
        virusScanStatus: {
            type: String,
            enum: ['PENDING', 'SAFE', 'INFECTED', 'UNKNOWN'],
            default: 'PENDING'
        }
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedAt: Date,
    retention: {
        type: String,
        enum: ['PERMANENT', '1_YEAR', '3_YEARS', '5_YEARS', '7_YEARS'],
        default: 'PERMANENT'
    }
}, { timestamps: true });

module.exports = mongoose.model('FileStorage', fileStorageSchema);
