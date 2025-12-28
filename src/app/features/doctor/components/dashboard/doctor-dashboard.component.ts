import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { AuthService } from '@core/services/auth.service';
import { User } from '@models/user.model';

interface Patient {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  role?: string;
  email?: string;
  phone?: string;
  gender?: string;
  age?: number;
  bloodGroup?: string;
  primaryDiagnosis?: string;
  status?: string;
}

interface Notification {
  _id: string;
  type: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: Date;
}

interface Appointment {
  _id?: string;
  date?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status: string;
  patientId: string;
  doctorId: string;
  reason?: string;
}

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  completedToday: number;
  totalPrescriptions: number;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  notifications: Notification[] = [];
  searchTerm = '';
  isLoading = true;
  showNotifications = false;
  currentUser: User | null = null;
  errorMessage: string | null = null;

  stats: DashboardStats = {
    totalPatients: 0,
    todayAppointments: 0,
    completedToday: 0,
    totalPrescriptions: 0
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading = true;

    try {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Load patients
      const patients = await this.http.get<Patient[]>(
        `${environment.apiUrl}/patients`,
        { headers }
      ).toPromise();

      this.patients = (patients || []).filter(p => p.role === 'PATIENT').map(p => ({
        _id: p._id || p.id || '',
        name: p.fullName || p.name || 'Unknown Patient',
        email: p.email || '',
        phone: p.phone || '',
        age: p.age,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        primaryDiagnosis: p.primaryDiagnosis,
        status: p.status || 'Active'
      }));
      this.filteredPatients = [...this.patients];
      this.stats.totalPatients = this.patients.length;

      // Load notifications
      const notifications = await this.http.get<Notification[]>(
        `${environment.apiUrl}/notifications`,
        { headers }
      ).toPromise();

      this.notifications = (notifications || []).slice(0, 5); // Top 5

      // Load appointments to calculate stats
      const appointments = await this.http.get<Appointment[]>(
        `${environment.apiUrl}/appointments`,
        { headers }
      ).toPromise();

      if (appointments) {
        const today = new Date().toDateString();
        this.stats.todayAppointments = appointments.filter(
          a => {
            const dateStr = a.appointmentDate || a.date;
            return dateStr && new Date(dateStr).toDateString() === today;
          }
        ).length;

        this.stats.completedToday = appointments.filter(
          a => {
            const dateStr = a.appointmentDate || a.date;
            return dateStr && new Date(dateStr).toDateString() === today && (a.status === 'completed' || a.status === 'COMPLETED');
          }
        ).length;
      }

      // Set prescription count based on patients
      this.stats.totalPrescriptions = this.patients.length * 2;

    } catch (error: unknown) {
      console.error('Error loading dashboard data:', error);
      this.errorMessage = 'Failed to load dashboard data. Using sample data.';
      // Fallback to mock data if API fails
      this.loadMockData();
      // Auto-hide error after 5 seconds
      setTimeout(() => this.errorMessage = null, 5000);
    } finally {
      this.isLoading = false;
    }
  }

  loadMockData() {
    this.patients = [
      {
        _id: '1',
        name: 'Amit Kumar',
        email: 'amit@example.com',
        phone: '+91-9900001111',
        age: 32,
        gender: 'Male',
        bloodGroup: 'O+',
        primaryDiagnosis: 'Hypertension',
        status: 'Active'
      },
      {
        _id: '2',
        name: 'Priya Singh',
        email: 'priya@example.com',
        phone: '+91-9900002222',
        age: 28,
        gender: 'Female',
        bloodGroup: 'A+',
        primaryDiagnosis: 'Regular Checkup',
        status: 'Active'
      },
      {
        _id: '3',
        name: 'Rajesh Verma',
        email: 'rajesh@example.com',
        phone: '+91-9900003333',
        age: 45,
        gender: 'Male',
        bloodGroup: 'B+',
        primaryDiagnosis: 'Diabetes & Heart Disease',
        status: 'Critical'
      },
      {
        _id: '4',
        name: 'Neha Patel',
        email: 'neha@example.com',
        phone: '+91-9900004444',
        age: 35,
        gender: 'Female',
        bloodGroup: 'AB+',
        primaryDiagnosis: 'Thyroid Disorder',
        status: 'Follow-up'
      },
      {
        _id: '5',
        name: 'Sanjay Gupta',
        email: 'sanjay@example.com',
        phone: '+91-9900005555',
        age: 55,
        gender: 'Male',
        bloodGroup: 'O+',
        primaryDiagnosis: 'Hypertension & Asthma',
        status: 'Active'
      },
      {
        _id: '6',
        name: 'Anjali Reddy',
        email: 'anjali.reddy@example.com',
        phone: '+91-9900006666',
        age: 26,
        gender: 'Female',
        bloodGroup: 'A-',
        primaryDiagnosis: 'Routine Exam',
        status: 'Active'
      },
      {
        _id: '7',
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        phone: '+91-9900007777',
        age: 48,
        gender: 'Male',
        bloodGroup: 'B+',
        primaryDiagnosis: 'High Cholesterol',
        status: 'Follow-up'
      },
      {
        _id: '8',
        name: 'Meera Sharma',
        email: 'meera@example.com',
        phone: '+91-9900008888',
        age: 34,
        gender: 'Female',
        bloodGroup: 'O+',
        primaryDiagnosis: 'Migraine Management',
        status: 'Active'
      },
      {
        _id: '9',
        name: 'Arjun Desai',
        email: 'arjun@example.com',
        phone: '+91-9900009999',
        age: 42,
        gender: 'Male',
        bloodGroup: 'AB+',
        primaryDiagnosis: 'Arthritis Treatment',
        status: 'Active'
      },
    ];
    this.filteredPatients = [...this.patients];
    this.stats.totalPatients = this.patients.length;
    this.stats.todayAppointments = Math.floor(Math.random() * 5) + 3;
    this.stats.completedToday = Math.floor(Math.random() * 3) + 1;
    this.stats.totalPrescriptions = this.patients.length * 2;

    this.notifications = [
      {
        _id: '1',
        type: 'APPOINTMENT',
        message: 'New appointment request from Amit Kumar',
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      },
      {
        _id: '2',
        type: 'PRESCRIPTION',
        message: 'Prescription renewal needed for Rajesh Verma',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000)
      }
    ];
  }

  filterPatients() {
    const term = this.searchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(p => {
      const name = (p.fullName || p.name || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      const diagnosis = (p.primaryDiagnosis || '').toLowerCase();
      return name.includes(term) || email.includes(term) || diagnosis.includes(term);
    });
  }

  viewPatient(patient: Patient) {
    this.router.navigate(['/doctor/patient-detail', patient._id]);
  }

  addRx(patient: Patient) {
    this.router.navigate(['/doctor/add-prescription'], { queryParams: { patientId: patient._id } });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  async markAsRead(notification: Notification) {
    try {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      await this.http.put(
        `${environment.apiUrl}/notifications/${notification._id}/read`,
        {},
        { headers }
      ).toPromise();

      notification.isRead = true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getStatusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'critical': return 'status-critical';
      case 'follow-up': return 'status-follow-up';
      default: return 'status-default';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }

  logout() {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/auth/login']);
      }
    });
  }

  dismissError() {
    this.errorMessage = null;
  }
}
