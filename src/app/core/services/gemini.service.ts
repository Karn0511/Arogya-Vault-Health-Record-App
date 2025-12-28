import { Injectable } from '@angular/core';
import { GoogleGenerativeAI, GenerateContentStreamResult } from '@google/generative-ai';
import { environment } from '@environments/environment';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  isLoading?: boolean;
  sources?: GroundingSource[];
}

export interface GroundingSource {
  uri: string;
  title?: string;
}

export interface PossibleCondition {
  name: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High';
  urgencyDescription: string;
}

export interface SymptomAnalysisResult {
  possibleConditions: PossibleCondition[];
  disclaimer: string;
}

export type AIMode = 'fast' | 'normal' | 'pro';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelCache: Map<AIMode, any> = new Map();

  constructor() {
    // Note: Direct Gemini calls from client are deprecated. 
    // Use AiService instead which routes through backend for security.
    const apiKey = environment.geminiApiKey || '';
    if (apiKey && apiKey.length > 10) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn('⚠️ GeminiService: Direct client-side AI calls disabled. Use AiService for backend-routed AI features.');
    }
  }

  private getModel(mode: AIMode) {
    if (!this.genAI) {
      throw new Error('Gemini service not configured. Please use AiService for AI features.');
    }
    
    if (this.modelCache.has(mode)) {
      return this.modelCache.get(mode);
    }

    const modelName = this.getModelName(mode);
    const model = this.genAI.getGenerativeModel({ model: modelName });
    this.modelCache.set(mode, model);
    return model;
  }

  private getModelName(mode: AIMode): string {
    switch (mode) {
      case 'fast':
        return 'gemini-1.5-flash-latest';
      case 'pro':
        return 'gemini-1.5-pro-latest';
      default:
        return 'gemini-1.5-flash-latest';
    }
  }

  async *getChatResponseStream(
    history: ChatMessage[],
    userMessage: ChatMessage,
    mode: AIMode = 'normal'
  ): AsyncGenerator<{ text: string; sources?: GroundingSource[] }> {
    const model = this.getModel(mode);

    // Convert history to Gemini format
    const geminiHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    // Create chat session
    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        temperature: mode === 'pro' ? 0.7 : 1.0,
        topK: mode === 'pro' ? 40 : 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    try {
      // Handle image if present
      let parts: any[] = [{ text: userMessage.text }];
      if (userMessage.image) {
        const base64Data = userMessage.image.split(',')[1];
        const mimeType = userMessage.image.split(';')[0].split(':')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }

      const result = await chat.sendMessageStream(parts);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield { text: chunkText };
      }
    } catch (error) {
      yield {
        text: 'Sorry, I encountered an error. Please try again.',
        sources: [],
      };
    }
  }

  async analyzeMedicalDocument(
    imageData: string,
    documentType: string
  ): Promise<string> {
    const model = this.getModel('normal');

    const prompt = `You are a medical document analyzer. Analyze this ${documentType} and provide:
1. Document type confirmation
2. Key findings and values
3. Any abnormal or concerning values
4. Recommendations (if applicable)

Please be concise and clear.`;

    try {
      // Validate API key
      if (!environment.geminiApiKey || environment.geminiApiKey.trim() === '') {
        throw new Error('Gemini API key is not configured. Please add your API key to the environment file.');
      }

      // Validate image data
      if (!imageData || !imageData.includes('base64')) {
        throw new Error('Invalid image data format');
      }

      const base64Data = imageData.split(',')[1];
      const mimeType = imageData.split(';')[0].split(':')[1];

      // Validate mime type
      if (!mimeType || !mimeType.startsWith('image/')) {
        throw new Error('Invalid image format. Please upload a valid image file (JPEG, PNG, etc.)');
      }

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      if (!text || text.trim() === '') {
        throw new Error('Gemini API returned an empty response');
      }

      return text;
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };

      // Provide more specific error messages
      if (err.message?.includes('API key')) {
        throw new Error('Invalid or missing Gemini API key. Please check your API key in the environment configuration.');
      } else if (err.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later or check your Gemini API quota.');
      } else if (err.message?.includes('permission')) {
        throw new Error('API permission denied. Please verify your Gemini API key has the necessary permissions.');
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (err.status === 400) {
        throw new Error('Invalid request. The image might be too large or in an unsupported format.');
      } else if (err.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (err.status === 500) {
        throw new Error('Gemini API server error. Please try again later.');
      } else {
        throw new Error(err.message || 'Failed to analyze document. Please try again.');
      }
    }
  }

  async getHealthInsights(vitalData: any[]): Promise<string> {
    const model = this.getModel('normal');

    const prompt = `Based on these vital signs: ${JSON.stringify(
      vitalData
    )}, provide:
1. Overall health assessment
2. Any concerning trends
3. Recommendations for improvement
4. Suggested lifestyle changes

Be helpful but remind that this is not medical advice.`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new Error('Failed to generate health insights');
    }
  }

  async symptomCheck(
    symptoms: string,
    age: number,
    sex: string
  ): Promise<SymptomAnalysisResult> {
    const model = this.getModel('normal');

    const prompt = `A ${age}-year-old ${sex} reports these symptoms: "${symptoms}".

Provide a JSON response with the following structure:
{
  "possibleConditions": [
    {
      "name": "Condition Name",
      "description": "Brief description of the condition",
      "urgency": "Low" | "Medium" | "High",
      "urgencyDescription": "What action to take"
    }
  ],
  "disclaimer": "Important medical disclaimer"
}

Provide 2-3 possible conditions ranked by likelihood.
Make urgency assessment realistic.
For urgencyDescription: suggest "Monitor symptoms", "See a doctor soon", or "Seek immediate medical attention".
Include a strong disclaimer about consulting healthcare professionals.

Return ONLY valid JSON, no markdown formatting.`;

    try {
      if (!environment.geminiApiKey) {
        throw new Error('Gemini API key is missing');
      }

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean up potential markdown formatting
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      try {
        const parsedResult: SymptomAnalysisResult = JSON.parse(jsonText);
        return parsedResult;
      } catch (parseError) {
        throw new Error('Failed to parse AI response. Please try again.');
      }
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };

      if (err.message?.includes('API key')) {
        throw new Error('Invalid or missing Gemini API key.');
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        throw new Error('Network error. Check internet connection.');
      } else if (err.status === 503) {
        throw new Error('Service overloaded. Please try again in a moment.');
      }

      throw new Error(err.message || 'Failed to analyze symptoms');
    }
  }
}
