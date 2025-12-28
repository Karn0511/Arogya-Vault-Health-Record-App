import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, UserManagementData } from '../../services/admin.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: UserManagementData[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  selectedUser: UserManagementData | null = null;
  showModal = false;
  showSuspendModal = false;
  suspendForm: FormGroup;

  currentPage = 1;
  pageSize = 10;
  totalUsers = 0;

  searchTerm = '';
  filterStatus = 'ALL';

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.suspendForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.adminService.getAllUsers(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.users = data.users || [];
        this.totalUsers = data.total || 0;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  selectUser(user: UserManagementData): void {
    this.selectedUser = user;
    this.showModal = true;
  }

  updateUserStatus(status: string): void {
    if (!this.selectedUser) return;

    this.loading = true;
    this.adminService.updateUserStatus(this.selectedUser.id, status).subscribe({
      next: () => {
        this.success = `User status updated to ${status}`;
        this.showModal = false;
        this.loadUsers();
        setTimeout(() => this.success = null, 3000);
      },
      error: () => {
        this.error = 'Failed to update user status';
        this.loading = false;
      }
    });
  }

  openSuspendModal(): void {
    this.showSuspendModal = true;
  }

  suspendUser(): void {
    if (!this.selectedUser || !this.suspendForm.valid) return;

    this.loading = true;
    this.adminService.suspendUser(this.selectedUser.id, this.suspendForm.value.reason).subscribe({
      next: () => {
        this.success = 'User suspended successfully';
        this.showModal = false;
        this.showSuspendModal = false;
        this.suspendForm.reset();
        this.loadUsers();
        setTimeout(() => this.success = null, 3000);
      },
      error: () => {
        this.error = 'Failed to suspend user';
        this.loading = false;
      }
    });
  }

  deleteUser(): void {
    if (!this.selectedUser || !confirm('Are you sure you want to delete this user?')) return;

    this.loading = true;
    this.adminService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.success = 'User deleted successfully';
        this.showModal = false;
        this.loadUsers();
        setTimeout(() => this.success = null, 3000);
      },
      error: () => {
        this.error = 'Failed to delete user';
        this.loading = false;
      }
    });
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'DOCTOR': return 'bg-blue-100 text-blue-800';
      case 'PATIENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  closeModals(): void {
    this.showModal = false;
    this.showSuspendModal = false;
    this.selectedUser = null;
    this.suspendForm.reset();
  }

  nextPage(): void {
    this.currentPage++;
    this.loadUsers();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }
}
