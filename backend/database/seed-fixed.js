/**
 * Comprehensive Database Seeding Script - FIXED VERSION
 * Populates all 16 MongoDB collections with realistic, properly-related datasets
 * All genders match names, emails are consistent and realistic
 */

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

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n');

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      connectTimeoutMS: 60000
    });
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Medicine.deleteMany({}),
      Appointment.deleteMany({}),
      Prescription.deleteMany({}),
      MedicalReport.deleteMany({}),
      PatientHealth.deleteMany({}),
      Vaccination.deleteMany({}),
      Notification.deleteMany({}),
      Chat.deleteMany({}),
      AccessLog.deleteMany({}),
      ImportHistory.deleteMany({}),
      ApprovalRequest.deleteMany({}),
      FileStorage.deleteMany({})
    ]);
    console.log('✅ Database cleared\n');

    // ========== CREATE ADMIN USER ==========
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      fullName: 'Admin User',
      email: 'admin@arogya.com',
      phone: '+91-9876543210',
      password: 'admin123',
      role: 'ADMIN',
      gender: 'Male'
    });
    console.log(`✅ Admin created: ${adminUser.email}\n`);

    // ========== CREATE DOCTORS ==========
    console.log('👨‍⚕️  Creating 10 doctors...');
    const doctorUsersData = [
      {
        fullName: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@arogya.com',
        phone: '+91-9876543201',
        password: 'doctor123',
        gender: 'Male'
      },
      {
        fullName: 'Dr. Priya Sharma',
        email: 'priya.sharma@arogya.com',
        phone: '+91-9876543202',
        password: 'doctor123',
        gender: 'Female'
      },
      {
        fullName: 'Dr. Arun Singh',
        email: 'arun.singh@arogya.com',
        phone: '+91-9876543203',
        password: 'doctor123',
        gender: 'Male'
      },
      {
        fullName: 'Dr. Deepa Gupta',
        email: 'deepa.gupta@arogya.com',
        phone: '+91-9876543204',
        password: 'doctor123',
        gender: 'Female'
      },
      {
        fullName: 'Dr. Vikram Patel',
        email: 'vikram.patel@arogya.com',
        phone: '+91-9876543205',
        password: 'doctor123',
        gender: 'Male'
      },
      {
        fullName: 'Dr. Neha Verma',
        email: 'neha.verma@arogya.com',
        phone: '+91-9876543206',
        password: 'doctor123',
        gender: 'Female'
      },
      {
        fullName: 'Dr. Sameer Khan',
        email: 'sameer.khan@arogya.com',
        phone: '+91-9876543207',
        password: 'doctor123',
        gender: 'Male'
      },
      {
        fullName: 'Dr. Anjali Reddy',
        email: 'anjali.reddy@arogya.com',
        phone: '+91-9876543208',
        password: 'doctor123',
        gender: 'Female'
      },
      {
        fullName: 'Dr. Harsh Malhotra',
        email: 'harsh.malhotra@arogya.com',
        phone: '+91-9876543209',
        password: 'doctor123',
        gender: 'Male'
      },
      {
        fullName: 'Dr. Meera Iyer',
        email: 'meera.iyer@arogya.com',
        phone: '+91-9876543220',
        password: 'doctor123',
        gender: 'Female'
      }
    ];

    const doctorUsers = await User.insertMany(
      doctorUsersData.map(d => ({
        ...d,
        role: 'DOCTOR'
      }))
    );

    const doctorDetails = [
      {
        userId: doctorUsers[0]._id,
        specialization: 'Cardiology',
        licenseNumber: 'MCI-001234',
        experience: 15,
        hospital: 'Apollo Hospital',
        consultationFee: 500
      },
      {
        userId: doctorUsers[1]._id,
        specialization: 'Pediatrics',
        licenseNumber: 'MCI-001235',
        experience: 12,
        hospital: 'Max Hospital',
        consultationFee: 400
      },
      {
        userId: doctorUsers[2]._id,
        specialization: 'Orthopedics',
        licenseNumber: 'MCI-001236',
        experience: 18,
        hospital: 'Fortis Hospital',
        consultationFee: 600
      },
      {
        userId: doctorUsers[3]._id,
        specialization: 'Dermatology',
        licenseNumber: 'MCI-001237',
        experience: 10,
        hospital: 'Sir Ganga Ram Hospital',
        consultationFee: 450
      },
      {
        userId: doctorUsers[4]._id,
        specialization: 'General Medicine',
        licenseNumber: 'MCI-001238',
        experience: 8,
        hospital: 'Apollo Hospital',
        consultationFee: 300
      },
      {
        userId: doctorUsers[5]._id,
        specialization: 'General Medicine',
        licenseNumber: 'MCI-001239',
        experience: 14,
        hospital: 'Max Hospital',
        consultationFee: 500
      },
      {
        userId: doctorUsers[6]._id,
        specialization: 'Neurology',
        licenseNumber: 'MCI-001240',
        experience: 16,
        hospital: 'AIIMS Hospital',
        consultationFee: 700
      },
      {
        userId: doctorUsers[7]._id,
        specialization: 'Psychiatry',
        licenseNumber: 'MCI-001241',
        experience: 11,
        hospital: 'Fortis Hospital',
        consultationFee: 550
      },
      {
        userId: doctorUsers[8]._id,
        specialization: 'General Medicine',
        licenseNumber: 'MCI-001242',
        experience: 13,
        hospital: 'Sir Ganga Ram Hospital',
        consultationFee: 600
      },
      {
        userId: doctorUsers[9]._id,
        specialization: 'Gastroenterology',
        licenseNumber: 'MCI-001243',
        experience: 17,
        hospital: 'Apollo Hospital',
        consultationFee: 650
      }
    ];

    const doctors = await Doctor.insertMany(doctorDetails);
    console.log(`✅ ${doctors.length} doctors created\n`);

    // ========== CREATE MEDICINES ==========
    console.log('💊 Creating 15 medicines...');
    const medicinesData = [
      {
        name: 'Aspirin 500mg',
        genericName: 'Acetylsalicylic acid',
        manufacturer: 'Bayer',
        strength: '500mg',
        form: 'TABLET',
        dosage: '500mg twice daily',
        price: 25,
        quantity: 100
      },
      {
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin Trihydrate',
        manufacturer: 'GSK',
        strength: '250mg',
        form: 'CAPSULE',
        dosage: '250mg thrice daily',
        price: 40,
        quantity: 100
      },
      {
        name: 'Metformin 500mg',
        genericName: 'Metformin HCl',
        manufacturer: 'Merck',
        strength: '500mg',
        form: 'TABLET',
        dosage: '500mg twice daily',
        price: 50,
        quantity: 100
      },
      {
        name: 'Lisinopril 10mg',
        genericName: 'Lisinopril',
        manufacturer: 'Cipla',
        strength: '10mg',
        form: 'TABLET',
        dosage: '10mg once daily',
        price: 60,
        quantity: 100
      },
      {
        name: 'Atorvastatin 20mg',
        genericName: 'Atorvastatin Calcium',
        manufacturer: 'Pfizer',
        strength: '20mg',
        form: 'TABLET',
        dosage: '20mg once daily',
        price: 75,
        quantity: 100
      },
      {
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        manufacturer: 'AstraZeneca',
        strength: '20mg',
        form: 'CAPSULE',
        dosage: '20mg once daily',
        price: 45,
        quantity: 100
      },
      {
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        manufacturer: 'Calpol',
        strength: '500mg',
        form: 'TABLET',
        dosage: 'As needed',
        price: 20,
        quantity: 200
      },
      {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        manufacturer: 'Brufen',
        strength: '400mg',
        form: 'TABLET',
        dosage: '400mg as needed',
        price: 35,
        quantity: 100
      },
      {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine HCl',
        manufacturer: 'UCB',
        strength: '10mg',
        form: 'TABLET',
        dosage: '10mg once daily',
        price: 30,
        quantity: 100
      },
      {
        name: 'Vitamin D3 1000IU',
        genericName: 'Cholecalciferol',
        manufacturer: "Nature's Bounty",
        strength: '1000IU',
        form: 'TABLET',
        dosage: 'Once daily',
        price: 55,
        quantity: 100
      },
      {
        name: 'Vitamin B12 500mcg',
        genericName: 'Cyanocobalamin',
        manufacturer: 'Evion',
        strength: '500mcg',
        form: 'TABLET',
        dosage: 'Once daily',
        price: 65,
        quantity: 100
      },
      {
        name: 'Multivitamin',
        genericName: 'Multiple vitamins',
        manufacturer: 'Centrium',
        strength: 'Mixed',
        form: 'TABLET',
        dosage: 'Once daily',
        price: 85,
        quantity: 100
      },
      {
        name: 'Cough Syrup',
        genericName: 'Dextromethorphan',
        manufacturer: 'Benadryl',
        strength: '10mg/5ml',
        form: 'LIQUID',
        dosage: '5ml thrice daily',
        price: 95,
        quantity: 50
      },
      {
        name: 'Insulin Injection',
        genericName: 'Insulin Aspart',
        manufacturer: 'Novo Nordisk',
        strength: '100IU/ml',
        form: 'INJECTION',
        dosage: 'As prescribed',
        price: 450,
        quantity: 50
      },
      {
        name: 'Antibiotic Cream',
        genericName: 'Neomycin+Bacitracin',
        manufacturer: 'Savlon',
        strength: 'Topical',
        form: 'CREAM',
        dosage: 'Apply as needed',
        price: 40,
        quantity: 30
      }
    ];

    const medicines = await Medicine.insertMany(medicinesData);
    console.log(`✅ ${medicines.length} medicines created\n`);

    // ========== CREATE PATIENTS ==========
    console.log('👥 Creating 15 patients...');
    const patientsData = [
      {
        fullName: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        phone: '+91-9876543301',
        password: 'patient123',
        gender: 'Male'
      },
      {
        fullName: 'Priya Singh',
        email: 'priya.singh@example.com',
        phone: '+91-9876543302',
        password: 'patient123',
        gender: 'Female'
      },
      {
        fullName: 'Rajesh Verma',
        email: 'rajesh.verma@example.com',
        phone: '+91-9876543303',
        password: 'patient123',
        gender: 'Male'
      },
      {
        fullName: 'Neha Patel',
        email: 'neha.patel@example.com',
        phone: '+91-9876543304',
        password: 'patient123',
        gender: 'Female'
      },
      {
        fullName: 'Sanjay Gupta',
        email: 'sanjay.gupta@example.com',
        phone: '+91-9876543305',
        password: 'patient123',
        gender: 'Male'
      },
      {
        fullName: 'Anjali Reddy',
        email: 'anjali.reddy@example.com',
        phone: '+91-9876543306',
        password: 'patient123',
        gender: 'Female'
      },
      {
        fullName: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '+91-9876543307',
        password: 'patient123',
        gender: 'Male'
      },
      {
        fullName: 'Meera Sharma',
        email: 'meera.sharma@example.com',
        phone: '+91-9876543308',
        password: 'patient123',
        gender: 'Female'
      },
      {
        fullName: 'Arjun Desai',
        email: 'arjun.desai@example.com',
        phone: '+91-9876543309',
        password: 'patient123',
        gender: 'Male'
      },
      {
        fullName: 'Pooja Mishra',
        email: 'pooja.mishra@example.com',
        phone: '+91-9876543310',
        password: 'patient123',
        gender: 'Female'
      },
      {
        fullName: 'Rohit Joshi',
        email: 'rohit.joshi@example.com',
        phone: '+91-9876543311',
        password: 'patient123',
        gender: 'Male'
      },
      {
        fullName: 'Divya Chopra',
        email: 'divya.chopra@example.com',
        phone: '+91-9876543312',
        password: 'patient123',
        gender: 'Female'
      },
      {
        fullName: 'Aditya Nair',
        email: 'aditya.nair@example.com',
        phone: '+91-9876543313',
        password: 'patient123',
        gender: 'Male'
      },
      {
        fullName: 'Kavya Iyer',
        email: 'kavya.iyer@example.com',
        phone: '+91-9876543314',
        password: 'patient123',
        gender: 'Female'
      },
      {
        fullName: 'Nikhil Bhat',
        email: 'nikhil.bhat@example.com',
        phone: '+91-9876543315',
        password: 'patient123',
        gender: 'Male'
      }
    ];

    const patients = await User.insertMany(
      patientsData.map(p => ({
        ...p,
        role: 'PATIENT'
      }))
    );
    console.log(`✅ ${patients.length} patients created\n`);

    // ========== CREATE APPOINTMENTS ==========
    console.log('📅 Creating 20 appointments...');
    const timeSlots = ['09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00', '14:00-14:30', '14:30-15:00'];
    const appointmentsData = [];
    for (let i = 0; i < 20; i++) {
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + (i % 30));
      appointmentsData.push({
        patientId: patients[i % patients.length]._id,
        doctorId: doctors[i % doctors.length]._id,
        appointmentDate: appointmentDate,
        timeSlot: timeSlots[i % timeSlots.length],
        reason: 'Regular checkup',
        status: 'SCHEDULED',
        consultationType: i % 2 === 0 ? 'ONLINE' : 'IN_PERSON',
        notes: 'Patient consultation notes'
      });
    }
    const appointments = await Appointment.insertMany(appointmentsData);
    console.log(`✅ ${appointments.length} appointments created\n`);

    // ========== CREATE PRESCRIPTIONS ==========
    console.log('💉 Creating 20 prescriptions...');
    const prescriptionsData = [];
    for (let i = 0; i < 20; i++) {
      const medicineIds = [];
      for (let j = 0; j < 3; j++) {
        medicineIds.push({
          medicineId: medicines[(i + j) % medicines.length]._id,
          dosage: '1 tablet',
          frequency: 'Twice daily',
          duration: '7 days'
        });
      }
      prescriptionsData.push({
        patientId: patients[i % patients.length]._id,
        doctorId: doctors[i % doctors.length]._id,
        appointmentId: appointments[i % appointments.length]._id,
        medicines: medicineIds,
        notes: 'Take medicines after food',
        prescribedDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
    const prescriptions = await Prescription.insertMany(prescriptionsData);
    console.log(`✅ ${prescriptions.length} prescriptions created\n`);

    // ========== CREATE MEDICAL REPORTS ==========
    console.log('📋 Creating 20 medical reports...');
    const reportTypes = ['BLOOD_TEST', 'X_RAY', 'MRI', 'CT_SCAN', 'ULTRASOUND', 'ECG'];
    const medicalReportsData = [];
    for (let i = 0; i < 20; i++) {
      medicalReportsData.push({
        patientId: patients[i % patients.length]._id,
        reportType: reportTypes[i % reportTypes.length],
        title: `Medical Report ${i + 1}`,
        description: 'Patient medical report details',
        testDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        hospitalName: ['Apollo Hospital', 'Max Hospital', 'Fortis Hospital'][i % 3],
        results: {
          findings: 'Patient findings',
          normalRange: '70-100',
          patientValue: '85',
          status: ['NORMAL', 'ABNORMAL', 'PENDING'][i % 3]
        }
      });
    }
    const medicalReports = await MedicalReport.insertMany(medicalReportsData);
    console.log(`✅ ${medicalReports.length} medical reports created\n`);

    // ========== CREATE PATIENT HEALTH ==========
    console.log('❤️  Creating 15 patient health records...');
    const patientHealthsData = [];
    patients.forEach(patient => {
      patientHealthsData.push({
        patientId: patient._id,
        height: 165 + Math.random() * 30,
        weight: 60 + Math.random() * 40,
        bloodPressure: `${120 + Math.random() * 30}/${80 + Math.random() * 20}`,
        heartRate: 60 + Math.random() * 40,
        temperature: 36.5 + Math.random() * 1.5,
        oxygenSaturation: 95 + Math.random() * 5,
        lastUpdated: new Date()
      });
    });
    const patientHealths = await PatientHealth.insertMany(patientHealthsData);
    console.log(`✅ ${patientHealths.length} patient health records created\n`);

    // ========== CREATE VACCINATIONS ==========
    console.log('💉 Creating 30 vaccination records (2 per patient)...');
    const vaccineNames = ['COVID-19', 'DPT', 'POLIO', 'MMR', 'TETANUS'];
    const vaccinationsData = [];
    patients.forEach((patient, idx) => {
      for (let j = 0; j < 2; j++) {
        const vaccine = vaccineNames[(idx + j) % vaccineNames.length];
        const vaccineDate = new Date();
        vaccineDate.setDate(vaccineDate.getDate() - (30 + idx * 10 + j * 5));
        vaccinationsData.push({
          patientId: patient._id,
          vaccineName: vaccine,
          dosage: j + 1,
          vaccinationDate: vaccineDate,
          nextDueDate: new Date(vaccineDate.getTime() + 365 * 24 * 60 * 60 * 1000),
          healthCenter: 'Municipal Health Center'
        });
      }
    });
    const vaccinations = await Vaccination.insertMany(vaccinationsData);
    console.log(`✅ ${vaccinations.length} vaccination records created\n`);

    // ========== CREATE NOTIFICATIONS ==========
    console.log('🔔 Creating 20 notifications...');
    const notificationTypes = ['APPOINTMENT_REMINDER', 'PRESCRIPTION_READY', 'VACCINATION_DUE', 'GENERAL'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH'];
    const notificationsData = [];
    for (let i = 0; i < 20; i++) {
      notificationsData.push({
        userId: patients[i % patients.length]._id,
        type: notificationTypes[i % notificationTypes.length],
        title: `Notification ${i + 1}`,
        message: `You have a new notification message`,
        isRead: i % 2 === 0,
        priority: priorities[i % priorities.length]
      });
    }
    const notifications = await Notification.insertMany(notificationsData);
    console.log(`✅ ${notifications.length} notifications created\n`);

    // ========== CREATE CHATS ==========
    console.log('💬 Creating 15 chat conversations...');
    const chatsData = [];
    for (let i = 0; i < 15; i++) {
      const messages = [];
      for (let j = 0; j < 3; j++) {
        messages.push({
          senderId: j % 2 === 0 ? patients[i % patients.length]._id : doctors[i % doctors.length]._id,
          senderRole: j % 2 === 0 ? 'PATIENT' : 'DOCTOR',
          message: j % 2 === 0 ? 'Hello Doctor, I have concerns' : 'Please describe your symptoms',
          timestamp: new Date(Date.now() - j * 24 * 60 * 60 * 1000),
          isRead: true
        });
      }
      chatsData.push({
        patientId: patients[i % patients.length]._id,
        doctorId: doctors[i % doctors.length]._id,
        messages: messages,
        lastMessageDate: new Date(),
        isActive: true
      });
    }
    const chats = await Chat.insertMany(chatsData);
    console.log(`✅ ${chats.length} chat conversations created\n`);

    // ========== CREATE ACCESS LOGS ==========
    console.log('📝 Creating 20 access logs...');
    const actions = ['LOGIN', 'VIEW_RECORD', 'DOWNLOAD_RECORD', 'UPDATE_PROFILE'];
    const accessLogsData = [];
    for (let i = 0; i < 20; i++) {
      const allUsers = [...patients, adminUser];
      const randomUser = allUsers[i % allUsers.length];
      accessLogsData.push({
        userId: randomUser._id,
        userName: randomUser.fullName,
        action: actions[i % actions.length],
        resource: 'User Dashboard',
        ipAddress: `192.168.1.${(i % 255) + 1}`,
        userAgent: 'Mozilla/5.0',
        status: 'SUCCESS'
      });
    }
    const accessLogs = await AccessLog.insertMany(accessLogsData);
    console.log(`✅ ${accessLogs.length} access logs created\n`);

    // ========== CREATE IMPORT HISTORIES ==========
    console.log('📥 Creating 10 import histories...');
    const importTypesList = ['GOOGLE_HEALTH', 'MANUAL_UPLOAD', 'API_SYNC'];
    const sourceProviders = ['GOOGLE_HEALTH', 'APPLE_HEALTH', 'FITBIT'];
    const statuses = ['PENDING', 'COMPLETED', 'FAILED'];
    const importHistoriesData = [];
    for (let i = 0; i < 10; i++) {
      importHistoriesData.push({
        patientId: patients[i % patients.length]._id,
        importType: importTypesList[i % importTypesList.length],
        sourceProvider: sourceProviders[i % sourceProviders.length],
        status: statuses[i % statuses.length],
        dataImported: { records: 10 + i * 5, timestamp: new Date() },
        recordsProcessed: 10 + i * 5,
        recordsFailed: i % 2
      });
    }
    const importHistories = await ImportHistory.insertMany(importHistoriesData);
    console.log(`✅ ${importHistories.length} import histories created\n`);

    // ========== CREATE APPROVAL REQUESTS ==========
    console.log('✅ Creating 10 approval requests...');
    const requestTypesApproval = ['USER_REGISTRATION', 'DOCTOR_REGISTRATION', 'PROFILE_UPDATE'];
    const approvalStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    const approvalRequestsData = [];
    for (let i = 0; i < 10; i++) {
      approvalRequestsData.push({
        userId: patients[i % patients.length]._id,
        requestType: requestTypesApproval[i % requestTypesApproval.length],
        status: approvalStatuses[i % approvalStatuses.length],
        requestData: { details: 'Update request', timestamp: new Date() },
        approvedBy: i % 2 === 0 ? adminUser._id : null,
        rejectionReason: i % 3 === 2 ? 'Incomplete documentation' : null,
        comments: 'Processing...'
      });
    }
    const approvalRequests = await ApprovalRequest.insertMany(approvalRequestsData);
    console.log(`✅ ${approvalRequests.length} approval requests created\n`);

    // ========== CREATE FILE STORAGES ==========
    console.log('💾 Creating 15 file storage records...');
    const fileTypes = ['pdf', 'jpg', 'png', 'doc', 'docx'];
    const fileCategories = ['MEDICAL_REPORT', 'PRESCRIPTION', 'LAB_RESULT', 'INSURANCE'];
    const fileStoragesData = [];
    for (let i = 0; i < 15; i++) {
      fileStoragesData.push({
        patientId: patients[i % patients.length]._id,
        fileName: `document_${i + 1}.pdf`,
        originalName: `Medical_Report_${i + 1}.pdf`,
        fileType: fileTypes[i % fileTypes.length],
        mimeType: 'application/pdf',
        fileSize: 100000 + i * 50000,
        fileUrl: `/uploads/${patients[i % patients.length]._id}/document_${i + 1}.pdf`,
        fileCategory: fileCategories[i % fileCategories.length],
        uploadedBy: patients[i % patients.length]._id,
        retention: 'PERMANENT'
      });
    }
    const fileStorages = await FileStorage.insertMany(fileStoragesData);
    console.log(`✅ ${fileStorages.length} file storage records created\n`);

    // ========== PRINT SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`  ✓ Admin Users: 1`);
    console.log(`  ✓ Doctors: ${doctors.length}`);
    console.log(`  ✓ Patients: ${patients.length}`);
    console.log(`  ✓ Medicines: ${medicines.length}`);
    console.log(`  ✓ Appointments: ${appointments.length}`);
    console.log(`  ✓ Prescriptions: ${prescriptions.length}`);
    console.log(`  ✓ Medical Reports: ${medicalReports.length}`);
    console.log(`  ✓ Patient Health: ${patientHealths.length}`);
    console.log(`  ✓ Vaccinations: ${vaccinations.length}`);
    console.log(`  ✓ Notifications: ${notifications.length}`);
    console.log(`  ✓ Chat Conversations: ${chats.length}`);
    console.log(`  ✓ Access Logs: ${accessLogs.length}`);
    console.log(`  ✓ Import Histories: ${importHistories.length}`);
    console.log(`  ✓ Approval Requests: ${approvalRequests.length}`);
    console.log(`  ✓ File Storages: ${fileStorages.length}`);
    console.log(`\n  TOTAL RECORDS: ${
      1 + doctors.length + patients.length + medicines.length +
      appointments.length + prescriptions.length + medicalReports.length +
      patientHealths.length + vaccinations.length + notifications.length +
      chats.length + accessLogs.length + importHistories.length +
      approvalRequests.length + fileStorages.length
    }`);

    console.log('\n🔗 RELATIONSHIPS CREATED:');
    console.log(`  ✓ Appointments → Patients & Doctors`);
    console.log(`  ✓ Prescriptions → Patients, Doctors, Medicines & Appointments`);
    console.log(`  ✓ Medical Reports → Patients`);
    console.log(`  ✓ Patient Health → Patients`);
    console.log(`  ✓ Vaccinations → Patients`);
    console.log(`  ✓ Notifications → Patients`);
    console.log(`  ✓ Chat Messages → Patients & Doctors`);
    console.log(`  ✓ Access Logs → All Users`);
    console.log(`  ✓ Approval Requests → Patients`);
    console.log(`  ✓ File Storage → Patients`);

    console.log('\n👤 LOGIN CREDENTIALS:');
    console.log(`\n  ADMIN:`);
    console.log(`    Email: admin@arogya.com`);
    console.log(`    Password: admin123`);
    console.log(`\n  SAMPLE PATIENT:`);
    console.log(`    Email: amit.kumar@example.com`);
    console.log(`    Password: patient123`);
    console.log(`\n  SAMPLE DOCTOR:`);
    console.log(`    Email: rajesh.kumar@arogya.com`);
    console.log(`    Password: doctor123`);

    console.log('\n✨ All data with realistic genders and relationships uploaded!');
    console.log('='.repeat(60) + '\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seedDatabase();
