require('dotenv').config({ path: '../.env' }); // Load .env from backend root
const mongoose = require('mongoose');

// CONFIGURATION
// const SOURCE_URI = 'mongodb://127.0.0.1:27017/arogya'; 
// Auth required for local DB:
const SOURCE_URI = 'mongodb://admin:admin123@localhost:27017/arogya?authSource=admin';

const TARGET_URI = process.env.MONGO_URI;

if (!TARGET_URI || TARGET_URI.includes('localhost')) {
    console.error('❌ TARGET_URI is not defined or looks local. Ensure .env has the Atlas URI.');
    process.exit(1);
}

// MODELS (Import generic schema-less access or require existing models)
// To keep it simple and robust, we will use raw generic Copy
const collections = [
    'users',
    'doctors',
    'appointments',
    'medicalreports',
    'medicines',
    'prescriptions',
    'patienthealths',
    'vaccinations',
    'notifications',
    'approvalrequests',
    'importhistories',
    'filestorages'
];

async function migrate() {
    console.log('🚀 Starting Migration: Local -> Atlas');
    console.log(`📤 Source: ${SOURCE_URI}`);
    console.log(`📥 Target: ${TARGET_URI.split('@')[1]}`); // Masked

    // 1. Connect to Source
    const sourceConn = await mongoose.createConnection(SOURCE_URI).asPromise();
    console.log('✅ Connected to Source DB');

    // 2. Connect to Target
    const targetConn = await mongoose.createConnection(TARGET_URI).asPromise();
    console.log('✅ Connected to Target DB');

    // 3. Migrate Loop
    for (const colName of collections) {
        try {
            const sourceModel = sourceConn.model(colName, new mongoose.Schema({}, { strict: false }), colName);
            const targetModel = targetConn.model(colName, new mongoose.Schema({}, { strict: false }), colName);

            const data = await sourceModel.find().lean();
            if (data.length === 0) {
                console.log(`⚠️  ${colName}: No data found. Skipping.`);
                continue;
            }

            console.log(`📦 ${colName}: Migrating ${data.length} documents...`);

            let inserted = 0;
            let updated = 0;

            for (const doc of data) {
                const { _id, ...rest } = doc;
                const result = await targetModel.updateOne(
                    { _id },
                    { $set: rest },
                    { upsert: true }
                );

                if (result.upsertedCount > 0) inserted++;
                else updated++;
            }

            console.log(`   Detailed: ${inserted} inserted, ${updated} updated.`);
        } catch (err) {
            console.error(`❌ Error migrating ${colName}:`, err.message);
        }
    }

    console.log('✨ Migration Complete!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Fatal Migration Error:', err);
    process.exit(1);
});
