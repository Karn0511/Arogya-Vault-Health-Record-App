const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    genericName: String,
    manufacturer: String,
    strength: String, // e.g., "500mg"
    form: {
        type: String,
        enum: ['TABLET', 'CAPSULE', 'LIQUID', 'INJECTION', 'POWDER', 'CREAM', 'PATCH'],
        required: true
    },
    description: String,
    uses: String,
    sideEffects: String,
    dosage: String, // e.g., "1 tablet twice daily"
    precautions: String,
    contraindications: String,
    drugInteractions: [String],
    storageInstructions: String,
    expiryDate: Date,
    price: Number,
    quantity: {
        type: Number,
        default: 0
    },
    batch: String,
    category: {
        type: String,
        enum: ['ANTIBIOTIC', 'ANTI_INFLAMMATORY', 'PAINKILLER', 'VITAMIN', 'ANTACID', 'ANTIHISTAMINE', 'ANTIHYPERTENSIVE', 'OTHER'],
        default: 'OTHER'
    },
    isOTC: {
        type: Boolean,
        default: true // Over-The-Counter
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    activeIngredients: [
        {
            ingredient: String,
            percentage: Number
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);
