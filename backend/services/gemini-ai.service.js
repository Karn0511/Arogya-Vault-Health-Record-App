const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAIService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('⚠️ Gemini API key not configured. AI features will return mock responses.');
      this.isConfigured = false;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      // Vision-capable model for images/documents
      this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.isConfigured = true;
      console.log('✅ Gemini AI service initialized');
    }
  }

  async analyzeImageDocument(imageData, documentType = 'Medical Document') {
    if (!this.isConfigured) {
      return {
        success: true,
        analysis: 'AI analysis mock: Gemini key not configured on server.',
        timestamp: new Date()
      };
    }

    if (!imageData || !imageData.includes('base64')) {
      throw new Error('Invalid image data format');
    }

    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(';')[0].split(':')[1];

    if (!mimeType || !mimeType.startsWith('image/')) {
      throw new Error('Invalid image format. Please upload a valid image file.');
    }

    const prompt = `You are a clinical document analyst. Analyze this ${documentType} and provide:
- Document type confirmation
- Key findings and values
- Abnormal or concerning values
- Clear, patient-friendly recommendations

Be concise and avoid jargon.`;

    try {
      const result = await this.visionModel.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        analysis: text,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Gemini image analysis error:', error);
      throw new Error(error?.message || 'Failed to analyze image');
    }
  }
  async chat(message, context = {}) {
    if (!this.isConfigured) {
      return this.getMockChatResponse(message, context);
    }

    try {
      const prompt = this.buildChatPrompt(message, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        response: text,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Gemini AI chat error:', error);
      return {
        success: false,
        error: 'Failed to get AI response',
        fallback: this.getMockChatResponse(message, context).response
      };
    }
  }

  async analyzeHealthReport(reportData, patientContext = {}) {
    if (!this.isConfigured) {
      return this.getMockReportAnalysis(reportData);
    }

    try {
      const prompt = `You are a medical AI assistant, and you have access to look the whole site for all info. Analyze the following health report and provide insights:

Report Details:
- Patient: ${patientContext.patientName || 'Unknown'}
- Age: ${patientContext.age || 'Unknown'}
- Test: ${reportData.testName}
- Results: ${reportData.results}
- Diagnosis: ${reportData.diagnosis}

Provide:
1. Key findings summary
2. Health implications
3. Recommended actions
4. Lifestyle suggestions

Keep the response professional, clear, and patient-friendly.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      return {
        success: true,
        analysis,
        recommendations: this.extractRecommendations(analysis),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Gemini AI report analysis error:', error);
      return this.getMockReportAnalysis(reportData);
    }
  }

  async getMedicationInteractions(medications) {
    if (!this.isConfigured) {
      return this.getMockInteractionCheck(medications);
    }

    try {
      const medicineList = medications.map(m => `${m.medicineName} (${m.dosage})`).join(', ');
      const prompt = `As a medical AI, analyze potential drug interactions for these medications: ${medicineList}

Provide:
1. Any known interactions
2. Severity level (mild/moderate/severe)
3. Precautions to take
4. Monitoring recommendations

Be concise and evidence-based.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      return {
        success: true,
        interactions: analysis,
        hasInteractions: analysis.toLowerCase().includes('interaction'),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Gemini AI interaction check error:', error);
      return this.getMockInteractionCheck(medications);
    }
  }

  async getHealthAdvice(symptoms, patientData = {}) {
    if (!this.isConfigured) {
      return this.getMockHealthAdvice(symptoms);
    }

    try {
      const prompt = `You are a medical AI assistant (not a replacement for professional medical advice).

Patient Context:
- Age: ${patientData.age || 'Unknown'}
- Gender: ${patientData.gender || 'Unknown'}
- Existing Conditions: ${patientData.primaryDiagnosis || 'None reported'}

Symptoms: ${symptoms}

Provide:
1. Possible causes (general information)
2. Self-care suggestions
3. When to seek medical attention
4. Red flag symptoms to watch for

IMPORTANT: Always remind the user to consult with their healthcare provider for proper diagnosis.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const advice = response.text();

      return {
        success: true,
        advice,
        urgencyLevel: this.assessUrgency(advice),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Gemini AI health advice error:', error);
      return this.getMockHealthAdvice(symptoms);
    }
  }

  buildChatPrompt(message, context) {
    let prompt = `You are Arogya AI, a helpful medical assistant chatbot. You provide health information, answer medical questions, and help users understand their health data.

Important guidelines:
- Be empathetic and professional
- Provide accurate, evidence-based information
- Always remind users to consult healthcare professionals for serious concerns
- Keep responses concise but informative
- Use simple language, avoid excessive medical jargon

`;

    if (context.userRole === 'PATIENT') {
      prompt += `User is a patient. `;
      if (context.patientName) prompt += `Patient name: ${context.patientName}. `;
      if (context.diagnosis) prompt += `Primary condition: ${context.diagnosis}. `;
    } else if (context.userRole === 'DOCTOR') {
      prompt += `User is a doctor. Provide more clinical details. `;
    }

    prompt += `\n\nUser message: ${message}\n\nProvide a helpful, compassionate response:`;

    return prompt;
  }

  extractRecommendations(analysis) {
    // Extract bullet points or numbered items as recommendations
    const lines = analysis.split('\n');
    const recommendations = lines.filter(line =>
      line.trim().match(/^[•\-*\d]/) || line.toLowerCase().includes('recommend')
    );
    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  assessUrgency(advice) {
    const urgentKeywords = ['emergency', 'urgent', 'immediately', 'seek medical attention', 'call doctor'];
    const moderateKeywords = ['consult', 'see doctor', 'medical evaluation'];

    const lowerAdvice = advice.toLowerCase();

    if (urgentKeywords.some(keyword => lowerAdvice.includes(keyword))) {
      return 'high';
    } else if (moderateKeywords.some(keyword => lowerAdvice.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  // Mock responses when API key not configured
  getMockChatResponse(message) {
    const responses = {
      greeting: "Hello! I'm Arogya AI, your health assistant. How can I help you today?",
      medication: "I can help you understand your medications. Please ensure you follow your doctor's prescriptions exactly as directed.",
      appointment: "To schedule or manage appointments, please use the appointments section or contact your healthcare provider directly.",
      symptoms: "I understand you're experiencing symptoms. While I can provide general information, it's important to consult with your healthcare provider for proper diagnosis and treatment.",
      default: "Thank you for your question. For personalized medical advice, please consult with your healthcare provider. I can help with general health information and navigating the Arogya platform."
    };

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.match(/hello|hi|hey|greet/)) {
      return { success: true, response: responses.greeting, timestamp: new Date() };
    } else if (lowerMessage.match(/medicine|medication|drug|prescription/)) {
      return { success: true, response: responses.medication, timestamp: new Date() };
    } else if (lowerMessage.match(/appointment|schedule|booking/)) {
      return { success: true, response: responses.appointment, timestamp: new Date() };
    } else if (lowerMessage.match(/symptom|pain|sick|feel|headache|fever/)) {
      return { success: true, response: responses.symptoms, timestamp: new Date() };
    }

    return { success: true, response: responses.default, timestamp: new Date() };
  }

  getMockReportAnalysis(reportData) {
    return {
      success: true,
      analysis: `Health Report Analysis for ${reportData.testName}:

**Key Findings:**
${reportData.results}

**Diagnosis:**
${reportData.diagnosis}

**Recommendations:**
- Continue monitoring as advised by your healthcare provider
- Maintain regular follow-up appointments
- Adhere to prescribed medications
- Follow dietary and lifestyle recommendations

Note: This is a general analysis. Please discuss detailed interpretation with your doctor.`,
      recommendations: [
        'Continue current treatment plan',
        'Schedule regular follow-ups',
        'Monitor symptoms daily',
        'Maintain healthy lifestyle'
      ],
      timestamp: new Date()
    };
  }

  getMockInteractionCheck(medications) {
    const hasPotentialInteraction = medications.length > 2;

    return {
      success: true,
      interactions: hasPotentialInteraction
        ? `With ${medications.length} medications, there may be potential interactions. Please ensure your doctor is aware of all medications you're taking. Common precautions include taking medications at different times and monitoring for side effects.`
        : 'No major interactions detected with the current medication list. Always inform your healthcare provider about all medications you take.',
      hasInteractions: hasPotentialInteraction,
      timestamp: new Date()
    };
  }

  getMockHealthAdvice(symptoms) {
    return {
      success: true,
      advice: `General Health Advice:

**About your symptoms:** ${symptoms}

**Self-care suggestions:**
- Rest and stay hydrated
- Monitor your symptoms
- Maintain a symptom diary
- Follow general health guidelines

**When to seek medical attention:**
- Symptoms worsen or persist
- You develop new concerning symptoms
- You have underlying health conditions

**Important:** This is general information only. Please consult your healthcare provider for proper medical diagnosis and treatment.`,
      urgencyLevel: 'medium',
      timestamp: new Date()
    };
  }
}

module.exports = new GeminiAIService();
