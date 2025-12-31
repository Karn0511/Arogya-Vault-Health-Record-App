import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  totalMedicines: number;
  activeAppointments: number;
  pendingApprovals: number;
}

export interface UserManagementData {
  id: string;
  fullName: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLogin: string;
}

export interface DoctorData {
  id: string;
  fullName: string;
  email: string;
  specialization: string;
  license: string;
  rating: number;
  verified: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface MedicineData {
  _id: string;
  name: string;
  category: string;
  dosage: string;
  sideEffects: string;
  price: number;
  stock: number;
  manufacturer: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;
  private statsSubject = new BehaviorSubject<AdminStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStats();
  }

  // Dashboard Stats
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin/stats`).pipe(
      tap(stats => this.statsSubject.next(stats))
    );
  }

  loadStats(): void {
    this.getStats().subscribe();
  }

  // User Management
  getAllUsers(page: number = 1, limit: number = 10): Observable<{ users: UserManagementData[]; total: number }> {
    return this.http.get<{ users: UserManagementData[]; total: number }>(`${this.apiUrl}/admin/users?page=${page}&limit=${limit}`);
  }

  getUserById(id: string): Observable<UserManagementData> {
    return this.http.get<UserManagementData>(`${this.apiUrl}/admin/users/${id}`);
  }

  updateUserStatus(id: string, status: string): Observable<UserManagementData> {
    return this.http.put<UserManagementData>(`${this.apiUrl}/admin/users/${id}/status`, { status });
  }

  suspendUser(id: string, reason: string): Observable<UserManagementData> {
    return this.http.put<UserManagementData>(`${this.apiUrl}/admin/users/${id}/suspend`, { reason });
  }

  deleteUser(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/admin/users/${id}`);
  }

  // Doctor Management
  getAllDoctors(page: number = 1, limit: number = 10): Observable<{ doctors: DoctorData[]; total: number }> {
    return this.http.get<{ doctors: DoctorData[]; total: number }>(`${this.apiUrl}/admin/doctors?page=${page}&limit=${limit}`);
  }

  getDoctorById(id: string): Observable<DoctorData> {
    return this.http.get<DoctorData>(`${this.apiUrl}/admin/doctors/${id}`);
  }

  verifyDoctor(id: string): Observable<DoctorData> {
    return this.http.put<DoctorData>(`${this.apiUrl}/admin/doctors/${id}/verify`, {});
  }

  approveDoctorProfile(id: string, approved: boolean): Observable<DoctorData> {
    return this.http.put<DoctorData>(`${this.apiUrl}/admin/doctors/${id}/approve`, { approved });
  }

  updateDoctorStatus(id: string, status: string): Observable<DoctorData> {
    return this.http.put<DoctorData>(`${this.apiUrl}/admin/doctors/${id}/status`, { status });
  }

  // Medicine Management
  getAllMedicines(page: number = 1, limit: number = 10): Observable<{ medicines: MedicineData[]; total: number }> {
    return this.http.get<{ medicines: MedicineData[]; total: number }>(`${this.apiUrl}/admin/medicines?page=${page}&limit=${limit}`);
  }

  getMedicineById(id: string): Observable<MedicineData> {
    return this.http.get<MedicineData>(`${this.apiUrl}/admin/medicines/${id}`);
  }

  createMedicine(medicine: Partial<MedicineData>): Observable<MedicineData> {
    return this.http.post<MedicineData>(`${this.apiUrl}/admin/medicines`, medicine);
  }

  updateMedicine(id: string, medicine: Partial<MedicineData>): Observable<MedicineData> {
    return this.http.put<MedicineData>(`${this.apiUrl}/admin/medicines/${id}`, medicine);
  }

  deleteMedicine(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/admin/medicines/${id}`);
  }

  // Analytics
  getAnalytics(filter: string = 'all'): Observable<{ data: unknown[] }> {
    return this.http.get<{ data: unknown[] }>(`${this.apiUrl}/admin/analytics?filter=${filter}`);
  }

  getUserGrowth(): Observable<{ growth: unknown[] }> {
    return this.http.get<{ growth: unknown[] }>(`${this.apiUrl}/admin/analytics/user-growth`);
  }

  getAppointmentStats(): Observable<{ stats: unknown[] }> {
    return this.http.get<{ stats: unknown[] }>(`${this.apiUrl}/admin/analytics/appointments`);
  }

  getRevenueStats(): Observable<{ revenue: unknown[] }> {
    return this.http.get<{ revenue: unknown[] }>(`${this.apiUrl}/admin/analytics/revenue`);
  }

  // Audit Logs
  getAuditLogs(page: number = 1, limit: number = 20): Observable<{ logs: unknown[]; total: number }> {
    return this.http.get<{ logs: unknown[]; total: number }>(`${this.apiUrl}/admin/audit-logs?page=${page}&limit=${limit}`);
  }

  // System Configuration
  getSystemConfig(): Observable<{ config: unknown }> {
    return this.http.get<{ config: unknown }>(`${this.apiUrl}/admin/config`);
  }

  updateSystemConfig(config: unknown): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/admin/config`, config);
  }

  // Approvals
  getPendingApprovals(): Observable<{ approvals: unknown[] }> {
    return this.http.get<{ approvals: unknown[] }>(`${this.apiUrl}/admin/approvals/pending`);
  }

  approveRequest(id: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/admin/approvals/${id}/approve`, {});
  }

  rejectRequest(id: string, reason: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/admin/approvals/${id}/reject`, { reason });
  }
}
