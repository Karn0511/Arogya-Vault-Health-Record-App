const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vaccineName: {
        type: String,
        required: true,
        enum: ['BCG', 'DPT', 'IPV', 'MMR', 'COVID-19', 'POLIO', 'HEPATITIS-A', 'HEPATITIS-B', 'TYPHOID', 'YELLOW-FEVER', 'TETANUS', 'OTHER']
    },
    dosage: {
        type: Number,
        required: true // e.g., 1, 2, 3 for booster doses
    },
    vaccinationDate: {
        type: Date,
        required: true
    },
    nextDueDate: Date,
    administeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    hospitalName: String,
    batchNumber: String,
    manufacturer: String,
    siteOfInjection: {
        type: String,
        enum: ['LEFT_ARM', 'RIGHT_ARM', 'LEFT_LEG', 'RIGHT_LEG']
    },
    adverseReactions: String,
    certificateUrl: String,
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'CANCELLED'],
        default: 'COMPLETED'
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Vaccination', vaccinationSchema);
