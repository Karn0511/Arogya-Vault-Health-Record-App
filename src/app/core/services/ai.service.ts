import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface SymptomCheckRequest {
  symptoms: string;
  patientData?: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
    currentMedications?: string;
  };
}

export interface SymptomCheckResponse {
  success: boolean;
  advice: string;
  recommendations: string[];
  timestamp: Date;
}

export interface ReportAnalysisRequest {
  reportData: {
    testName: string;
    results: string;
    diagnosis: string;
  };
  patientContext?: {
    patientName?: string;
    age?: number;
  };
}

export interface ReportAnalysisResponse {
  success: boolean;
  analysis: string;
  recommendations: string[];
  timestamp: Date;
}

export interface ChatMessage {
  message: string;
  context?: any;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  timestamp: Date;
}

export interface Medication {
  medicineName: string;
  dosage: string;
  frequency?: string;
}

export interface MedicationInteractionResponse {
  success: boolean;
  interactions: Array<{
    severity: string;
    description: string;
  }>;
  warnings: string[];
  timestamp: Date;
}

export interface ImageAnalysisRequest {
  imageData: string;
  documentType?: string;
}

export interface ImageAnalysisResponse {
  success: boolean;
  analysis: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  /**
   * Check symptoms and get AI health advice
   * @param request Symptom check request with symptoms and patient data
   * @returns Observable of symptom check response
   */
  checkSymptoms(request: SymptomCheckRequest): Observable<SymptomCheckResponse> {
    return this.http.post<SymptomCheckResponse>(`${this.apiUrl}/symptom-checker`, request);
  }

  /**
   * Analyze medical report using AI
   * @param request Report analysis request
   * @returns Observable of report analysis response
   */
  analyzeReport(request: ReportAnalysisRequest): Observable<ReportAnalysisResponse> {
    return this.http.post<ReportAnalysisResponse>(`${this.apiUrl}/analyze-report`, request);
  }

  /**
   * Chat with AI about health concerns
   * @param message Chat message
   * @param context Optional context for conversation
   * @returns Observable of chat response
   */
  chat(message: string, context?: any): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, { message, context });
  }

  /**
   * Check for medication interactions
   * @param medications Array of medications
   * @returns Observable of interaction check response
   */
  checkMedicationInteractions(medications: Medication[]): Observable<MedicationInteractionResponse> {
    return this.http.post<MedicationInteractionResponse>(`${this.apiUrl}/check-interactions`, { medications });
  }

  analyzeImage(request: ImageAnalysisRequest): Observable<ImageAnalysisResponse> {
    return this.http.post<ImageAnalysisResponse>(`${this.apiUrl}/analyze-image`, request);
  }
}
