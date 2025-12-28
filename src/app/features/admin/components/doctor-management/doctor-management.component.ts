import { Component, OnInit } from '@angular/core';
import { AdminService, DoctorData } from '../../services/admin.service';

@Component({
  selector: 'app-doctor-management',
  templateUrl: './doctor-management.component.html',
  styleUrls: ['./doctor-management.component.scss']
})
export class DoctorManagementComponent implements OnInit {
  doctors: DoctorData[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  selectedDoctor: DoctorData | null = null;
  showModal = false;

  currentPage = 1;
  pageSize = 10;
  totalDoctors = 0;

  filterVerified = 'ALL';
  searchTerm = '';

  constructor(
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.error = null;
    this.adminService.getAllDoctors(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.doctors = data.doctors || [];
        this.totalDoctors = data.total || 0;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load doctors';
        this.loading = false;
      }
    });
  }

  selectDoctor(doctor: DoctorData): void {
    this.selectedDoctor = doctor;
    this.showModal = true;
  }

  verifyDoctor(): void {
    if (!this.selectedDoctor) return;

    this.loading = true;
    this.adminService.verifyDoctor(this.selectedDoctor.id).subscribe({
      next: () => {
        this.success = 'Doctor verified successfully';
        this.showModal = false;
        this.loadDoctors();
        setTimeout(() => this.success = null, 3000);
      },
      error: () => {
        this.error = 'Failed to verify doctor';
        this.loading = false;
      }
    });
  }

  approveProfile(approve: boolean): void {
    if (!this.selectedDoctor) return;

    this.loading = true;
    this.adminService.approveDoctorProfile(this.selectedDoctor.id, approve).subscribe({
      next: () => {
        this.success = approve ? 'Doctor profile approved' : 'Doctor profile rejected';
        this.showModal = false;
        this.loadDoctors();
        setTimeout(() => this.success = null, 3000);
      },
      error: () => {
        this.error = 'Failed to update profile approval';
        this.loading = false;
      }
    });
  }

  updateStatus(status: string): void {
    if (!this.selectedDoctor) return;

    this.loading = true;
    this.adminService.updateDoctorStatus(this.selectedDoctor.id, status).subscribe({
      next: () => {
        this.success = `Doctor status updated to ${status}`;
        this.showModal = false;
        this.loadDoctors();
        setTimeout(() => this.success = null, 3000);
      },
      error: () => {
        this.error = 'Failed to update doctor status';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  getVerificationColor(verified: boolean): string {
    return verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDoctor = null;
  }

  nextPage(): void {
    this.currentPage++;
    this.loadDoctors();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDoctors();
    }
  }

  getRatingStars(rating: number): string {
    return '⭐'.repeat(Math.round(rating));
  }
}
