const mongoose = require('mongoose');

const patientHealthSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    dateOfBirth: Date,
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    height: Number, // in cm
    weight: Number, // in kg
    allergies: [String],
    chronicDiseases: [String], // e.g., ['Diabetes', 'Hypertension']
    surgicalHistory: [String],
    familyHistory: {
        diabetes: Boolean,
        hypertension: Boolean,
        heartDisease: Boolean,
        cancer: Boolean,
        mentalIllness: Boolean,
        other: String
    },
    currentMedications: [
        {
            medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
            medicineName: String,
            startDate: Date,
            dosage: String
        }
    ],
    vitals: [
        {
            recordedAt: Date,
            temperature: Number, // Celsius
            bloodPressure: String, // e.g., "120/80"
            heartRate: Number, // bpm
            respiratoryRate: Number,
            oxygenSaturation: Number, // %
            bloodGlucose: Number
        }
    ],
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    insuranceInfo: {
        provider: String,
        policyNumber: String,
        validFrom: Date,
        validTo: Date
    },
    lastCheckupDate: Date,
    nextCheckupDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('PatientHealth', patientHealthSchema);
