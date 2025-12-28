const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
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
    medicines: [
        {
            medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
            medicineName: String,
            dosage: String, // e.g., "500mg"
            frequency: String, // e.g., "Twice daily"
            duration: String, // e.g., "7 days"
            instructions: String, // e.g., "Take after food"
            refills: Number
        }
    ],
    diagnosis: String,
    notes: String,
    validFrom: Date,
    validUntil: Date,
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED', 'FULFILLED', 'CANCELLED'],
        default: 'ACTIVE'
    },
    isDigital: {
        type: Boolean,
        default: true
    },
    prescriptionFileUrl: String, // PDF of prescription
    isShared: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
