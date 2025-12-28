import { Component } from '@angular/core';
import { AiService, SymptomCheckResponse } from '@core/services/ai.service';

@Component({
  selector: 'app-symptom-checker',
  templateUrl: './symptom-checker.component.html',
  styleUrls: ['./symptom-checker.component.scss']
})
export class SymptomCheckerComponent {
  symptoms: string = '';
  age: string = '';
  sex: string = '';
  isLoading: boolean = false;
  error: string = '';
  result: SymptomCheckResponse | null = null;
  recommendations: string[] = [];

  constructor(private aiService: AiService) {}

  async onSubmit(): Promise<void> {
    if (!this.symptoms || !this.age || !this.sex) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.result = null;
    this.recommendations = [];

    try {
      const response = await this.aiService.checkSymptoms({
        symptoms: this.symptoms,
        patientData: {
          age: parseInt(this.age),
          gender: this.sex,
        }
      }).toPromise();

      this.result = response || null;
      this.recommendations = response?.recommendations || [];
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'An unknown error occurred.';
    } finally {
      this.isLoading = false;
    }
  }
}
