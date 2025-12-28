import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, MedicineData } from '../../services/admin.service';

@Component({
  selector: 'app-medicine-management',
  templateUrl: './medicine-management.component.html',
  styleUrls: ['./medicine-management.component.scss']
})
export class MedicineManagementComponent implements OnInit {
  medicines: MedicineData[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  selectedMedicine: MedicineData | null = null;
  showModal = false;
  showEditModal = false;

  medicineForm: FormGroup;

  currentPage = 1;
  pageSize = 10;
  totalMedicines = 0;

  searchTerm = '';

  categories = [
    'PAINKILLER', 'ANTIBIOTIC', 'ANTIVIRAL', 'ANTACID',
    'VITAMIN', 'CALCIUM', 'IRON', 'OTHER'
  ];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.medicineForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      dosage: ['', Validators.required],
      sideEffects: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      manufacturer: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.loading = true;
    this.error = null;
    this.adminService.getAllMedicines(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.medicines = data.medicines || [];
        this.totalMedicines = data.total || 0;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load medicines';
        this.loading = false;
      }
    });
  }

  selectMedicine(medicine: MedicineData): void {
    this.selectedMedicine = medicine;
    this.showModal = true;
  }

  openAddMedicineModal(): void {
    this.medicineForm.reset();
    this.selectedMedicine = null;
    this.showEditModal = true;
  }

  openEditMedicineModal(medicine: MedicineData): void {
    this.selectedMedicine = medicine;
    this.medicineForm.patchValue({
      name: medicine.name,
      category: medicine.category,
      dosage: medicine.dosage,
      sideEffects: medicine.sideEffects,
      price: medicine.price,
      stock: medicine.stock,
      manufacturer: medicine.manufacturer
    });
    this.showEditModal = true;
  }

  saveMedicine(): void {
    if (!this.medicineForm.valid) return;

    this.loading = true;
    const formData = this.medicineForm.value;

    if (this.selectedMedicine) {
      // Update existing
      this.adminService.updateMedicine(this.selectedMedicine._id, formData).subscribe({
        next: () => {
          this.success = 'Medicine updated successfully';
          this.showEditModal = false;
          this.medicineForm.reset();
          this.loadMedicines();
          setTimeout(() => this.success = null, 3000);
        },
        error: () => {
          this.error = 'Failed to update medicine';
          this.loading = false;
        }
      });
    } else {
      // Create new
      this.adminService.createMedicine(formData).subscribe({
        next: () => {
          this.success = 'Medicine created successfully';
          this.showEditModal = false;
          this.medicineForm.reset();
          this.loadMedicines();
          setTimeout(() => this.success = null, 3000);
        },
        error: () => {
          this.error = 'Failed to create medicine';
          this.loading = false;
        }
      });
    }
  }

  deleteMedicine(medicineId: string): void {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    this.loading = true;
    this.adminService.deleteMedicine(medicineId).subscribe({
      next: () => {
        this.success = 'Medicine deleted successfully';
        this.showModal = false;
        this.loadMedicines();
        setTimeout(() => this.success = null, 3000);
      },
      error: () => {
        this.error = 'Failed to delete medicine';
        this.loading = false;
      }
    });
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return '🔴 Out of Stock';
    if (stock < 10) return '🟡 Low Stock';
    return '🟢 In Stock';
  }

  getStockColor(stock: number): string {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  closeModals(): void {
    this.showModal = false;
    this.showEditModal = false;
    this.selectedMedicine = null;
    this.medicineForm.reset();
  }

  nextPage(): void {
    this.currentPage++;
    this.loadMedicines();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMedicines();
    }
  }
}
