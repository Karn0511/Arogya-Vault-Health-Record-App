const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const FileStorage = require('../models/FileStorage');
const s3Service = require('../services/s3.service');

// Setup multer for file handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get presigned URL for upload
router.post('/presigned-url', auth, async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'fileName and fileType required' });
    }

    const presignedData = await s3Service.getPresignedUploadUrl(fileName, fileType);

    res.json({
      success: true,
      data: presignedData
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({ success: false, message: 'Error generating presigned URL' });
  }
});

// Upload file to S3 and save metadata with history
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { fileCategory, description, relatedAppointmentId, relatedReportId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // Upload to S3
    const uploadResult = await s3Service.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'patient-files'
    );

    // Get file extension
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'gif', 'txt'];
    const fileType = allowedExts.includes(fileExt) ? fileExt : 'other';

    // Save metadata to MongoDB
    const fileStorage = new FileStorage({
      patientId: req.user.id,
      fileName: uploadResult.s3Key,
      originalName: req.file.originalname,
      fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: uploadResult.fileUrl,
      s3Key: uploadResult.s3Key,
      fileCategory: fileCategory || 'OTHER',
      relatedAppointmentId: relatedAppointmentId || null,
      relatedReportId: relatedReportId || null,
      description: description || '',
      uploadedBy: req.user.id
    });

    await fileStorage.save();

    // Create upload history record (optional - for tracking purposes)
    try {
      const ImportHistory = require('../models/ImportHistory');
      const uploadHistory = new ImportHistory({
        patientId: req.user.id,
        importType: 'MANUAL_UPLOAD',
        sourceProvider: 'MANUAL',
        status: 'COMPLETED',
        dataImported: {
          fileId: fileStorage._id,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          uploadedAt: new Date()
        },
        recordsProcessed: 1,
        recordsFailed: 0
      });
      await uploadHistory.save();
    } catch (historyError) {
      console.log('History tracking skipped:', historyError.message);
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileStorageId: fileStorage._id,
        fileUrl: uploadResult.fileUrl,
        s3Key: uploadResult.s3Key,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
});

// Get upload history
router.get('/upload-history', auth, async (req, res) => {
  try {
    const ImportHistory = require('../models/ImportHistory');
    const history = await ImportHistory.find({
      patientId: req.user.id,
      importType: 'MANUAL_UPLOAD'
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get upload history error:', error);
    res.status(500).json({ success: false, message: 'Error fetching upload history' });
  }
});

// Get all files for patient
router.get('/my-files', auth, async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const query = { patientId: req.user.id, isArchived: false };
    if (category) query.fileCategory = category;

    const skip = (page - 1) * limit;

    const files = await FileStorage.find(query)
      .select('fileName originalName fileType fileSize fileUrl fileCategory description uploadedAt metadata.accessCount')
      .sort({ 'metadata.uploadedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FileStorage.countDocuments(query);

    // Generate presigned download URLs
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const downloadUrl = await s3Service.getPresignedDownloadUrl(file.s3Key);
        return {
          ...file.toObject(),
          downloadUrl
        };
      })
    );

    res.json({
      success: true,
      data: filesWithUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving files' });
  }
});

// Get file by ID
router.get('/:fileId', auth, async (req, res) => {
  try {
    const file = await FileStorage.findById(req.params.fileId)
      .populate('relatedAppointmentId', 'date doctor reason')
      .populate('relatedReportId', 'title description');

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check access permission
    if (file.patientId.toString() !== req.user.id && !file.accessibleTo.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Generate presigned URL
    const downloadUrl = await s3Service.getPresignedDownloadUrl(file.s3Key);

    // Update access metadata
    file.metadata.accessCount += 1;
    file.metadata.lastAccessedAt = new Date();
    await file.save();

    res.json({
      success: true,
      data: {
        ...file.toObject(),
        downloadUrl
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving file' });
  }
});

// Delete file
router.delete('/:fileId', auth, async (req, res) => {
  try {
    const file = await FileStorage.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check ownership
    if (file.patientId.toString() !== req.user.id && file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Delete from S3
    await s3Service.deleteFile(file.s3Key);

    // Delete from MongoDB
    await FileStorage.findByIdAndDelete(req.params.fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, message: 'Error deleting file' });
  }
});

// Archive file
router.patch('/:fileId/archive', auth, async (req, res) => {
  try {
    const file = await FileStorage.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    file.isArchived = true;
    file.archivedAt = new Date();
    await file.save();

    res.json({
      success: true,
      message: 'File archived successfully'
    });
  } catch (error) {
    console.error('Archive file error:', error);
    res.status(500).json({ success: false, message: 'Error archiving file' });
  }
});

// Get storage statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await FileStorage.aggregate([
      { $match: { patientId: mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$fileCategory',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);

    const totalSize = stats.reduce((sum, item) => sum + item.totalSize, 0);
    const totalFiles = stats.reduce((sum, item) => sum + item.count, 0);

    res.json({
      success: true,
      data: {
        totalFiles,
        totalSize,
        byCategory: stats
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving statistics' });
  }
});

module.exports = router;
