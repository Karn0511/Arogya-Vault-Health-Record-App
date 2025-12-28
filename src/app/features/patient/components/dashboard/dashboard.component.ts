import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { RecentRecord, UpcomingAppointment } from '@models/dashboard.model';
import { User } from '@models/user.model';
import { environment } from '@environments/environment';

interface QuickAction {
  icon: string;
  label: string;
  route: string;
}

interface StatCard {
  label: string;
  value: string;
  icon: string;
}

interface HealthInsight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
  icon: string;
}

interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

interface MedicationSchedule {
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface HealthGoal {
  title: string;
  target: string;
  current: string;
  progress: number;
  icon: string;
  color: string;
}

interface LabResult {
  test: string;
  value: string;
  status: 'normal' | 'high' | 'low';
  date: string;
}

interface Vaccination {
  name: string;
  date: string;
  nextDue?: string;
  status: 'completed' | 'due' | 'overdue';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userName = 'User';
  currentUser: User | null = null;
  recentRecords: RecentRecord[] = [];
  upcomingAppointments: UpcomingAppointment[] = [];

  stats = {
    totalRecords: 0,
    activeMedications: 0,
    upcomingAppointments: 0,
  };

  quickActions: QuickAction[] = [
    { icon: 'upload', label: 'Add Record', route: '/patient/records' },
    { icon: 'pill', label: 'Add Medication', route: '/patient/medications' },
    { icon: 'user', label: 'Update Profile', route: '/patient/health-profile' },
  ];

  vitalStats: StatCard[] = [
    { label: 'Heart Rate', value: '72 bpm', icon: 'heart' },
    { label: 'Blood Pressure', value: '120/80', icon: 'activity' },
    { label: 'Blood Sugar', value: '95 mg/dL', icon: 'droplet' },
    { label: 'Weight', value: '68 kg', icon: 'weight' },
  ];

  healthInsights: HealthInsight[] = [
    {
      title: 'Great Progress!',
      description: 'Your vitals are within healthy ranges. Keep it up!',
      type: 'success',
      icon: 'check-circle',
    },
    {
      title: 'Medication Reminder',
      description: "Don't forget to take your evening medication at 8 PM",
      type: 'warning',
      icon: 'bell',
    },
    {
      title: 'Health Tip',
      description: '30 minutes of daily exercise can improve cardiovascular health',
      type: 'info',
      icon: 'info',
    },
  ];

  emergencyContacts: EmergencyContact[] = [
    { name: 'Dr. Sarah Johnson', relation: 'Primary Care', phone: '+1 (555) 123-4567' },
    { name: 'John Doe', relation: 'Emergency Contact', phone: '+1 (555) 987-6543' },
  ];

  medicationSchedule: MedicationSchedule[] = [
    { name: 'Aspirin', dosage: '100mg', time: '8:00 AM', taken: true, type: 'morning' },
    { name: 'Metformin', dosage: '500mg', time: '12:00 PM', taken: false, type: 'afternoon' },
    { name: 'Lisinopril', dosage: '10mg', time: '6:00 PM', taken: false, type: 'evening' },
    { name: 'Atorvastatin', dosage: '20mg', time: '10:00 PM', taken: false, type: 'night' },
  ];

  healthGoals: HealthGoal[] = [
    {
      title: 'Daily Steps',
      target: '10,000',
      current: '7,500',
      progress: 75,
      icon: 'walking',
      color: 'blue',
    },
    {
      title: 'Water Intake',
      target: '8 glasses',
      current: '5 glasses',
      progress: 62,
      icon: 'droplet',
      color: 'cyan',
    },
    {
      title: 'Sleep Hours',
      target: '8 hours',
      current: '7 hours',
      progress: 87,
      icon: 'moon',
      color: 'purple',
    },
    {
      title: 'Exercise',
      target: '30 min',
      current: '20 min',
      progress: 66,
      icon: 'fitness',
      color: 'green',
    },
  ];

  labResults: LabResult[] = [
    { test: 'Blood Glucose', value: '95 mg/dL', status: 'normal', date: 'Nov 20' },
    { test: 'Cholesterol', value: '210 mg/dL', status: 'high', date: 'Nov 20' },
    { test: 'Blood Pressure', value: '120/80', status: 'normal', date: 'Nov 25' },
    { test: 'Hemoglobin', value: '14.5 g/dL', status: 'normal', date: 'Nov 20' },
  ];

  vaccinations: Vaccination[] = [
    {
      name: 'COVID-19 Booster',
      date: 'Oct 15, 2024',
      nextDue: 'Apr 15, 2025',
      status: 'completed',
    },
    { name: 'Flu Shot', date: 'Sep 1, 2024', nextDue: 'Sep 1, 2025', status: 'completed' },
    { name: 'Tetanus', date: 'Jan 10, 2023', nextDue: 'Jan 10, 2033', status: 'completed' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.fullName.split(' ')[0];
      this.currentUser = user;
      // Load REAL data from database
      this.loadDashboardData();
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  private loadDashboardData(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Load appointments
    this.http.get<any>(`${environment.apiUrl}/data/appointments`, { headers })
      .subscribe({
        next: (response) => {
          const appointments = response.data || response;
          const userId = this.currentUser?._id || this.currentUser?.id;
          // Filter for future appointments belonging to this user
          const futureAppts = appointments.filter((apt: any) => {
            const aptDate = new Date(apt.date);
            const patientId = apt.patientId?._id || apt.patientId?.id || apt.patientId;
            return aptDate >= new Date() && patientId === userId;
          }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

          this.upcomingAppointments = futureAppts.slice(0, 5).map((apt: any) => ({
            doctor: apt.doctorId?.name || 'Dr. Unknown',
            specialization: apt.reason || 'Check-up',
            date: apt.date ? new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'
          }));
          this.stats.upcomingAppointments = futureAppts.length;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load appointments:', err);
          this.stats.upcomingAppointments = 0;
          this.upcomingAppointments = [];
        }
      });

    // Load patient health records
    this.http.get<any>(`${environment.apiUrl}/data/patient-health`, { headers })
      .subscribe({
        next: (response) => {
          const records = Array.isArray(response) ? response : response.data || [];
          this.recentRecords = records.slice(0, 5).map((rec: any) => ({
            id: rec._id,
            name: rec.recordName || rec.name || 'Health Record',
            type: rec.type || 'other',
            date: rec.date ? new Date(rec.date).toLocaleDateString() : new Date().toLocaleDateString()
          }));
          this.stats.totalRecords = records.length;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load health records:', err);
          this.stats.totalRecords = 0;
          this.recentRecords = [];
        }
      });

    // Load medications/prescriptions
    this.http.get<any>(`${environment.apiUrl}/data/prescriptions`, { headers })
      .subscribe({
        next: (response) => {
          const prescriptions = response.data || response;
          this.stats.activeMedications = Array.isArray(prescriptions) ? prescriptions.length : 0;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load prescriptions:', err);
          this.stats.activeMedications = 0;
        }
      });

    // Load vaccinations
    this.http.get<any>(`${environment.apiUrl}/data/vaccinations`, { headers })
      .subscribe({
        next: (response) => {
          const vaccinations = response.data || response;
          this.vaccinations = Array.isArray(vaccinations) ? vaccinations.slice(0, 5) : [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load vaccinations:', err);
          this.vaccinations = [];
        }
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getRecordIcon(type: string): string {
    const icons: Record<string, string> = {
      prescription: 'file-text',
      'lab-report': 'flask',
      vaccination: 'syringe',
      other: 'file',
    };
    return icons[type] || 'file';
  }

  toggleMedication(medication: MedicationSchedule): void {
    const index = this.medicationSchedule.indexOf(medication);
    if (index > -1) {
      const newSchedule = [...this.medicationSchedule];
      newSchedule[index] = { ...medication, taken: !medication.taken };
      this.medicationSchedule = newSchedule;
    }
    // Here you would typically save this to the backend
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      normal: 'text-green-600 bg-green-500/10',
      high: 'text-red-600 bg-red-500/10',
      low: 'text-yellow-600 bg-yellow-500/10',
      completed: 'text-green-600 bg-green-500/10',
      due: 'text-blue-600 bg-blue-500/10',
      overdue: 'text-red-600 bg-red-500/10',
    };
    return colors[status] || 'text-muted-foreground bg-muted';
  }
}
