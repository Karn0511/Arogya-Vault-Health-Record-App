const express = require('express');
const router = express.Router();
const geminiService = require('../services/gemini-ai.service');
const User = require('../models/User');
const PatientHealth = require('../models/PatientHealth');
const checkAuth = require('../middleware/auth');

// Chat with AI
router.post('/chat', checkAuth, async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        // Enrich context with user info
        const userContext = {
            ...context,
            userId: req.userData.id,
            userRole: req.userData.role,
            patientName: req.userData.fullName
        };

        const response = await geminiService.chat(message, userContext);
        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, error: 'Failed to process chat' });
    }
});

// Symptom Checker
router.post('/symptom-checker', checkAuth, async (req, res) => {
    try {
        const { symptoms, patientData } = req.body;

        if (!symptoms || !symptoms.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Symptoms description is required'
            });
        }

        // Get user data for context
        const user = await User.findById(req.userData.id);
        const patientHealth = await PatientHealth.findOne({ patientId: req.userData.id });

        const contextData = {
            age: patientData?.age || 'Unknown',
            gender: user?.gender || 'Unknown',
            medicalHistory: patientData?.medicalHistory || '',
            currentMedications: patientData?.currentMedications || '',
            vitals: patientHealth ? {
                bloodPressure: patientHealth.bloodPressure,
                heartRate: patientHealth.heartRate,
                temperature: patientHealth.temperature
            } : {}
        };

        const advice = await geminiService.getHealthAdvice(symptoms, contextData);

        res.json({
            success: true,
            advice: advice.advice || advice.response,
            recommendations: advice.recommendations || [],
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Symptom checker error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze symptoms',
            message: error.message
        });
    }
});

// Health Report Analysis
router.post('/analyze-report', checkAuth, async (req, res) => {
    try {
        const { reportData, patientContext } = req.body;

        if (!reportData) {
            return res.status(400).json({
                success: false,
                error: 'Report data is required'
            });
        }

        const analysis = await geminiService.analyzeHealthReport(reportData, patientContext);

        res.json({
            success: true,
            analysis: analysis.analysis,
            recommendations: analysis.recommendations || [],
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Report analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze report',
            message: error.message
        });
    }
});

// Image Analysis
router.post('/analyze-image', checkAuth, async (req, res) => {
    try {
        const { imageData, documentType } = req.body;

        if (!imageData) {
            return res.status(400).json({ success: false, error: 'Image data is required' });
        }

        const analysis = await geminiService.analyzeImageDocument(imageData, documentType);
        res.json(analysis);
    } catch (error) {
        console.error('Image analysis error:', error);
        res.status(500).json({ success: false, error: 'Failed to analyze image' });
    }
});

// Medication Interaction Check
router.post('/check-interactions', checkAuth, async (req, res) => {
    try {
        const { medications } = req.body;

        if (!medications || !Array.isArray(medications) || medications.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Medications array is required'
            });
        }

        const interactions = await geminiService.getMedicationInteractions(medications);

        res.json({
            success: true,
            interactions: interactions.interactions || [],
            warnings: interactions.warnings || [],
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Medication interaction check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check interactions',
            message: error.message
        });
    }
});

module.exports = router;
