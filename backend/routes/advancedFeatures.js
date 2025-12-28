// ========== GOOGLE API & AI IMPORT VAULT ==========
const ApprovalRequest = require('../models/ApprovalRequest');
const ImportHistory = require('../models/ImportHistory');
const FileStorage = require('../models/FileStorage');

/**
 * Import vault data from Google Health using AI analysis
 * POST /api/ai-imports/google-vault
 */
async function importFromGoogleVault(app, checkAuth) {
    app.post('/api/ai-imports/google-vault', checkAuth, async (req, res, next) => {
        try {
            const { googleAccessToken } = req.body;

            if (!googleAccessToken) {
                return res.status(400).json({ error: 'Google access token required' });
            }

            // Start import history record
            const importRecord = new ImportHistory({
                patientId: req.userData.id,
                importType: 'GOOGLE_HEALTH',
                sourceProvider: 'GOOGLE_HEALTH',
                status: 'IN_PROGRESS',
                dataImported: { googleAccessToken: '***' },
                createdBy: req.userData.id
            });

            await importRecord.save();

            // Simulate AI processing
            setTimeout(async () => {
                try {
                    // This would integrate with actual Google Health API
                    const mockData = {
                        vitals: [
                            { bloodPressure: '120/80', date: new Date(), source: 'Google Fit' },
                            { heartRate: 72, date: new Date(), source: 'Google Fit' },
                            { weight: 75, date: new Date(), source: 'Google Health' }
                        ],
                        medications: [
                            { name: 'Aspirin', dosage: '500mg', frequency: 'daily' }
                        ]
                    };

                    // AI Analysis
                    const aiAnalysis = {
                        detectedConditions: ['Stable health'],
                        riskFactors: [],
                        recommendations: ['Continue current medication', 'Monitor blood pressure regularly'],
                        confidence: 0.95
                    };

                    importRecord.status = 'COMPLETED';
                    importRecord.dataImported = mockData;
                    importRecord.recordsProcessed = 3;
                    importRecord.recordsSuccessful = 3;
                    importRecord.aiAnalysis = aiAnalysis;
                    importRecord.completedAt = new Date();
                    importRecord.duration = Date.now() - importRecord.startedAt;

                    await importRecord.save();

                    // Create notification
                    const Notification = require('../models/Notification');
                    await Notification.create({
                        userId: req.userData.id,
                        type: 'IMPORT_COMPLETED',
                        title: 'Vault Import Complete',
                        message: `${mockData.vitals.length} vital records imported successfully`,
                        priority: 'HIGH'
                    });

                } catch (err) {
                    importRecord.status = 'FAILED';
                    importRecord.errorDetails = [err.message];
                    await importRecord.save();
                }
            }, 5000);

            res.json({
                message: 'Import started',
                importId: importRecord._id,
                status: 'IN_PROGRESS'
            });

        } catch (error) {
            next(error);
        }
    });
}

/**
 * Get import history
 * GET /api/ai-imports/history
 */
async function getImportHistory(app, checkAuth) {
    app.get('/api/ai-imports/history', checkAuth, async (req, res, next) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            let query = { patientId: req.userData.id };

            if (status) query.status = status;

            const imports = await ImportHistory.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const total = await ImportHistory.countDocuments(query);

            res.json({
                imports,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            next(error);
        }
    });
}

/**
 * Get import details
 * GET /api/ai-imports/:importId
 */
async function getImportDetails(app, checkAuth) {
    app.get('/api/ai-imports/:importId', checkAuth, async (req, res, next) => {
        try {
            const importRecord = await ImportHistory.findById(req.params.importId);

            if (!importRecord) {
                return res.status(404).json({ error: 'Import not found' });
            }

            if (importRecord.patientId.toString() !== req.userData.id && req.userData.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Access denied' });
            }

            res.json(importRecord);

        } catch (error) {
            next(error);
        }
    });
}

/**
 * File upload with GridFS
 * POST /api/files/upload
 */
async function uploadFile(app, checkAuth, upload) {
    app.post('/api/files/upload', checkAuth, upload.single('file'), async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const fileStorage = new FileStorage({
                patientId: req.userData.id,
                fileName: req.file.filename,
                originalName: req.file.originalname,
                fileType: req.file.originalname.split('.').pop().toLowerCase(),
                mimeType: req.file.mimetype,
                fileSize: req.file.size,
                fileUrl: `/uploads/${req.file.filename}`,
                fileCategory: req.body.fileCategory || 'OTHER',
                description: req.body.description,
                uploadedBy: req.userData.id,
                tags: req.body.tags ? req.body.tags.split(',') : [],
                relatedReportId: req.body.relatedReportId,
                relatedAppointmentId: req.body.relatedAppointmentId,
                isPublic: req.body.isPublic === 'true'
            });

            await fileStorage.save();

            res.status(201).json({
                message: 'File uploaded successfully',
                file: fileStorage,
                fileUrl: `/uploads/${req.file.filename}`
            });

        } catch (error) {
            // Clean up uploaded file on error
            if (req.file) {
                const fs = require('fs');
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            next(error);
        }
    });
}

/**
 * Get patient files
 * GET /api/files
 */
async function getPatientFiles(app, checkAuth) {
    app.get('/api/files', checkAuth, async (req, res, next) => {
        try {
            const { category, page = 1, limit = 20 } = req.query;
            let query = { patientId: req.userData.id, isArchived: false };

            if (category) query.fileCategory = category;

            const files = await FileStorage.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await FileStorage.countDocuments(query);

            res.json({
                files,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            next(error);
        }
    });
}

/**
 * Delete file
 * DELETE /api/files/:fileId
 */
async function deleteFile(app, checkAuth) {
    app.delete('/api/files/:fileId', checkAuth, async (req, res, next) => {
        try {
            const file = await FileStorage.findById(req.params.fileId);

            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            if (file.patientId.toString() !== req.userData.id && req.userData.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Access denied' });
            }

            // Delete physical file
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(__dirname, '..', 'uploads', file.fileName);

            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting physical file:', err);
            });

            await FileStorage.findByIdAndDelete(req.params.fileId);

            res.json({ message: 'File deleted successfully' });

        } catch (error) {
            next(error);
        }
    });
}

/**
 * Approval workflow
 * POST /api/approvals/submit
 */
async function submitApproval(app, checkAuth) {
    app.post('/api/approvals/submit', checkAuth, async (req, res, next) => {
        try {
            const { requestType, requestData } = req.body;

            const approval = new ApprovalRequest({
                userId: req.userData.id,
                requestType,
                requestData,
                status: 'PENDING',
                priority: requestData.priority || 'MEDIUM'
            });

            await approval.save();

            res.status(201).json({
                message: 'Approval request submitted',
                approval
            });

        } catch (error) {
            next(error);
        }
    });
}

/**
 * Get pending approvals (ADMIN)
 * GET /api/approvals/pending
 */
async function getPendingApprovals(app, checkAuth) {
    app.get('/api/approvals/pending', checkAuth, async (req, res, next) => {
        try {
            if (req.userData.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const approvals = await ApprovalRequest.find({ status: 'PENDING' })
                .populate('userId', 'email fullName')
                .sort({ priority: -1, createdAt: 1 });

            res.json(approvals);

        } catch (error) {
            next(error);
        }
    });
}

/**
 * Approve request
 * POST /api/approvals/:approvalId/approve
 */
async function approveRequest(app, checkAuth) {
    app.post('/api/approvals/:approvalId/approve', checkAuth, async (req, res, next) => {
        try {
            if (req.userData.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const approval = await ApprovalRequest.findByIdAndUpdate(
                req.params.approvalId,
                {
                    status: 'APPROVED',
                    approvedBy: req.userData.id,
                    approvedAt: new Date(),
                    comments: req.body.comments
                },
                { new: true }
            );

            // Create notification for user
            const Notification = require('../models/Notification');
            await Notification.create({
                userId: approval.userId,
                type: 'APPROVAL_GRANTED',
                title: `${approval.requestType} Approved`,
                message: `Your ${approval.requestType} request has been approved`,
                priority: 'HIGH'
            });

            res.json(approval);

        } catch (error) {
            next(error);
        }
    });
}

/**
 * Reject request
 * POST /api/approvals/:approvalId/reject
 */
async function rejectRequest(app, checkAuth) {
    app.post('/api/approvals/:approvalId/reject', checkAuth, async (req, res, next) => {
        try {
            if (req.userData.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const approval = await ApprovalRequest.findByIdAndUpdate(
                req.params.approvalId,
                {
                    status: 'REJECTED',
                    approvedBy: req.userData.id,
                    rejectionReason: req.body.reason,
                    approvedAt: new Date()
                },
                { new: true }
            );

            // Create notification
            const Notification = require('../models/Notification');
            await Notification.create({
                userId: approval.userId,
                type: 'APPROVAL_DENIED',
                title: `${approval.requestType} Rejected`,
                message: `Your ${approval.requestType} request was rejected. Reason: ${req.body.reason}`,
                priority: 'HIGH'
            });

            res.json(approval);

        } catch (error) {
            next(error);
        }
    });
}

module.exports = {
    importFromGoogleVault,
    getImportHistory,
    getImportDetails,
    uploadFile,
    getPatientFiles,
    deleteFile,
    submitApproval,
    getPendingApprovals,
    approveRequest,
    rejectRequest
};
