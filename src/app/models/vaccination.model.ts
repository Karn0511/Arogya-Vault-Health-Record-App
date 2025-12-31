export interface Vaccination {
  id: string;
  patientId: string;
  vaccineName: string;
  vaccineCode?: string; // WHO/ICD code
  doseNumber: number;
  totalDoses?: number;
  dateGiven: Date;
  nextDueDate?: Date;
  administeredBy?: string;
  batchNumber?: string;
  manufacturer?: string;
  location?: string;
  notes?: string;
  certificateUrl?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateVaccinationDto {
  vaccineName: string;
  vaccineCode?: string;
  doseNumber: number;
  totalDoses?: number;
  dateGiven: Date;
  nextDueDate?: Date;
  administeredBy?: string;
  batchNumber?: string;
  manufacturer?: string;
  location?: string;
  notes?: string;
  certificateFile?: File;
}

export interface VaccinationSchedule {
  vaccineName: string;
  recommendedAge?: string;
  totalDoses: number;
  schedule: string[];
  description?: string;
}
