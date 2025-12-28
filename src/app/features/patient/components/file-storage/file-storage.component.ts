import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUploadService, FileUploadData, StorageStatsResponse } from '@shared/services/file-upload.service';
import { HttpEvent } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-file-storage',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './file-storage.component.html',
  styleUrls: ['./file-storage.component.scss']
})
export class FileStorageComponent implements OnInit, OnDestroy {
  files: FileUploadData[] = [];
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  storageStats: StorageStatsResponse['data'] | null = null;
  selectedCategory = 'ALL';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  showUploadModal = false;
  deleteConfirm: string | null = null;

  categories = [
    { value: 'ALL', label: 'All Files' },
    { value: 'MEDICAL_REPORT', label: 'Medical Reports' },
    { value: 'PRESCRIPTION', label: 'Prescriptions' },
    { value: 'LAB_RESULT', label: 'Lab Results' },
    { value: 'INSURANCE', label: 'Insurance Documents' },
    { value: 'PERSONAL', label: 'Personal' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fileUploadService: FileUploadService,
    private formBuilder: FormBuilder
  ) {
    this.uploadForm = this.formBuilder.group({
      description: ['', Validators.maxLength(500)],
      category: ['PERSONAL', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFiles();
    this.loadStorageStats();
    this.fileUploadService.getUploadProgress()
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        if (progress) {
          this.uploadProgress = progress.progress;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFiles(): void {
    const category = this.selectedCategory !== 'ALL' ? this.selectedCategory : undefined;
    this.fileUploadService.getUserFiles(category, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.files = response.data;
          this.totalPages = response.pagination.pages;
        },
        error: (error) => {
          console.error('Error loading files:', error);
        }
      });
  }

  loadStorageStats(): void {
    this.fileUploadService.getStorageStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.storageStats = response.data;
        },
        error: (error) => {
          console.error('Error loading storage stats:', error);
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validation = this.fileUploadService.validateFile(file);

      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      this.selectedFile = file;
    }
  }

  onUpload(): void {
    if (!this.selectedFile || !this.uploadForm.valid) {
      alert('Please select a file and fill in required fields');
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;

    this.fileUploadService.uploadFile(
      this.selectedFile,
      this.uploadForm.get('category')?.value,
      this.uploadForm.get('description')?.value
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (event: HttpEvent<{ success?: boolean }>) => {
        if (event.type === 4 && 'body' in event && event.body?.success) {
          this.uploading = false;
          this.uploadProgress = 0;
          this.selectedFile = null;
          this.uploadForm.reset({ category: 'PERSONAL' });
          this.showUploadModal = false;
          this.loadFiles();
          this.loadStorageStats();
        }
      },
      error: (error: unknown) => {
        this.uploading = false;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        alert('Upload failed: ' + errorMsg);
      }
    });
  }

  downloadFile(file: FileUploadData): void {
    this.fileUploadService.getFile(file._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const link = document.createElement('a');
          link.href = response.data.fileUrl;
          link.download = response.data.originalName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (error) => {
          alert('Download failed: ' + (error.message || 'Unknown error'));
        }
      });
  }

  deleteFile(fileId: string): void {
    if (this.deleteConfirm !== fileId) {
      this.deleteConfirm = fileId;
      return;
    }

    this.fileUploadService.deleteFile(fileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deleteConfirm = null;
          this.loadFiles();
          this.loadStorageStats();
        },
        error: (error) => {
          alert('Delete failed: ' + (error.message || 'Unknown error'));
        }
      });
  }

  archiveFile(fileId: string): void {
    this.fileUploadService.archiveFile(fileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadFiles();
        },
        error: (error) => {
          alert('Archive failed: ' + (error.message || 'Unknown error'));
        }
      });
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadFiles();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadFiles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadFiles();
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(fileType: string): string {
    return this.fileUploadService.getFileIcon(fileType);
  }

  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.uploadForm.reset({ category: 'PERSONAL' });
  }
}
