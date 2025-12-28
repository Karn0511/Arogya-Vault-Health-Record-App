import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AiService, SymptomCheckResponse } from '@core/services/ai.service';

@Component({
  selector: 'app-symptom-checker',
  templateUrl: './symptom-checker.component.html',
  styleUrls: ['./symptom-checker.component.scss']
})
export class SymptomCheckerComponent implements OnInit {
  symptomForm: FormGroup;
  loading = false;
  result: SymptomCheckResponse | null = null;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private aiService: AiService
  ) {
    this.symptomForm = this.fb.group({
      symptoms: ['', [Validators.required, Validators.minLength(10)]],
      age: ['', [Validators.min(0), Validators.max(120)]],
      gender: [''],
      medicalHistory: [''],
      currentMedications: ['']
    });
  }

  ngOnInit(): void {}

  checkSymptoms(): void {
    if (this.symptomForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.result = null;

    const formValue = this.symptomForm.value;
    const request = {
      symptoms: formValue.symptoms,
      patientData: {
        age: formValue.age || undefined,
        gender: formValue.gender || undefined,
        medicalHistory: formValue.medicalHistory || undefined,
        currentMedications: formValue.currentMedications || undefined
      }
    };

    this.aiService.checkSymptoms(request).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to analyze symptoms. Please try again.';
        this.loading = false;
        console.error('Symptom check error:', err);
      }
    });
  }

  reset(): void {
    this.symptomForm.reset();
    this.result = null;
    this.error = null;
  }
}
