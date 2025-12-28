import { Component, OnInit } from '@angular/core';

interface VitalRecord {
  type: string;
  value: string;
  unit: string;
  date: string;
  status: 'normal' | 'warning' | 'critical';
}

interface ChronicCondition {
  name: string;
  diagnosedDate: string;
  status: 'active' | 'managed' | 'resolved';
}

@Component({
  selector: 'app-health-profile',
  templateUrl: './health-profile.component.html',
  styleUrls: ['./health-profile.component.scss'],
})
export class HealthProfileComponent implements OnInit {
  profile = {
    age: 34,
    bloodType: 'O+',
    height: 175,
    weight: 70,
    bmi: 22.9,
    emergencyContact: '+91 98765 43210',
  };

  vitals: VitalRecord[] = [
    {
      type: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      date: '2025-11-20',
      status: 'normal',
    },
    {
      type: 'Heart Rate',
      value: '72',
      unit: 'bpm',
      date: '2025-11-20',
      status: 'normal',
    },
    {
      type: 'Blood Sugar',
      value: '95',
      unit: 'mg/dL',
      date: '2025-11-18',
      status: 'normal',
    },
    {
      type: 'Temperature',
      value: '98.6',
      unit: '°F',
      date: '2025-11-15',
      status: 'normal',
    },
  ];

  chronicConditions: ChronicCondition[] = [
    { name: 'Asthma', diagnosedDate: '2015-03-10', status: 'managed' },
  ];

  allergies = ['Peanuts', 'Penicillin'];

  constructor() {}

  ngOnInit(): void {}

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      normal: 'text-green-500',
      warning: 'text-yellow-500',
      critical: 'text-red-500',
      active: 'text-red-500',
      managed: 'text-green-500',
      resolved: 'text-gray-500',
    };
    return colors[status] || 'text-gray-500';
  }
}
