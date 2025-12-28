const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const PatientHealth = require('../models/PatientHealth');
const Vaccination = require('../models/Vaccination');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const AccessLog = require('../models/AccessLog');
const ImportHistory = require('../models/ImportHistory');
const ApprovalRequest = require('../models/ApprovalRequest');
const FileStorage = require('../models/FileStorage');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://admin:admin123@localhost:27017/arogya?authSource=admin';

async function removeEmptyCollections() {
  try {
    console.log('🗑️  Removing empty collections...');

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      connectTimeoutMS: 60000
    });

    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      if (count === 0) {
        await mongoose.connection.db.collection(collection.name).drop();
        console.log(`✅ Removed empty collection: ${collection.name}`);
      }
    }

    console.log('✅ Finished removing empty collections.');
  } catch (error) {
    console.error('❌ Error removing empty collections:', error);
  } finally {
    await mongoose.connection.close();
  }
}

removeEmptyCollections();
