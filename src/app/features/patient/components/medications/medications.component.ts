import { Component, OnInit } from '@angular/core';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  active: boolean;
}

@Component({
  selector: 'app-medications',
  templateUrl: './medications.component.html',
  styleUrls: ['./medications.component.scss'],
})
export class MedicationsComponent implements OnInit {
  medications: Medication[] = [
    {
      id: '1',
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3 times daily',
      startDate: '2025-11-15',
      endDate: '2025-11-25',
      prescribedBy: 'Dr. Smith',
      active: true,
    },
    {
      id: '2',
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Once daily',
      startDate: '2025-01-01',
      prescribedBy: 'Dr. Johnson',
      active: true,
    },
  ];

  showAddModal = false;

  constructor() {}

  ngOnInit(): void {}

  get activeMedications(): Medication[] {
    return this.medications.filter((m) => m.active);
  }

  get inactiveMedications(): Medication[] {
    return this.medications.filter((m) => !m.active);
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  deleteMedication(medication: Medication): void {
    if (confirm(`Are you sure you want to remove "${medication.name}"?`)) {
      this.medications = this.medications.filter((m) => m.id !== medication.id);
    }
  }

  toggleActive(medication: Medication): void {
    medication.active = !medication.active;
  }
}
