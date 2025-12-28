import { Component, OnInit } from '@angular/core';

interface MedicalRecord {
  id: string;
  name: string;
  type: string;
  date: string;
  size?: string;
  tags?: string[];
  title?: string;
  recordType?: string;
  recordDate?: Date | string;
  fileUrl?: string;
  fileName?: string;
}

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss'],
})
export class RecordsComponent implements OnInit {
  records: MedicalRecord[] = [];
  filteredRecords: MedicalRecord[] = [];
  searchQuery = '';
  selectedType = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  showUploadModal = false;
  showShareModal = false;
  selectedRecord: MedicalRecord | null = null;

  recordTypes = [
    { value: 'all', label: 'All Records' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'lab-report', label: 'Lab Reports' },
    { value: 'vaccination', label: 'Vaccinations' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'other', label: 'Other' },
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    // Mock data - replace with actual service call
    this.records = [
      {
        id: '1',
        name: 'Blood Test Results',
        type: 'lab-report',
        date: '2025-11-20',
        size: '2.4 MB',
        tags: ['CBC', 'Routine'],
      },
      {
        id: '2',
        name: 'Prescription - Dr. Smith',
        type: 'prescription',
        date: '2025-11-18',
        size: '0.5 MB',
        tags: ['Antibiotics'],
      },
      {
        id: '3',
        name: 'COVID-19 Vaccination Certificate',
        type: 'vaccination',
        date: '2025-11-15',
        size: '0.8 MB',
        tags: ['COVID-19', 'Vaccine'],
      },
      {
        id: '4',
        name: 'Chest X-Ray',
        type: 'imaging',
        date: '2025-11-10',
        size: '5.2 MB',
        tags: ['X-Ray', 'Chest'],
      },
    ];
    this.filterRecords();
  }

  filterRecords(): void {
    let filtered = this.records;

    if (this.selectedType !== 'all') {
      filtered = filtered.filter((r) => r.type === this.selectedType);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    this.filteredRecords = filtered;
  }

  onSearch(): void {
    this.filterRecords();
  }

  onTypeChange(): void {
    this.filterRecords();
  }

  // Upload related properties
  uploadFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  newRecord = {
    name: '',
    type: 'other',
    date: new Date().toISOString().split('T')[0],
    tags: ''
  };

  openUploadModal(): void {
    this.showUploadModal = true;
    this.resetUploadForm();
  }

  closeUploadModal(): void {
    if (!this.uploading) {
      this.showUploadModal = false;
      this.resetUploadForm();
    }
  }

  resetUploadForm(): void {
    this.uploadFile = null;
    this.uploading = false;
    this.uploadProgress = 0;
    this.newRecord = {
      name: '',
      type: 'other',
      date: new Date().toISOString().split('T')[0],
      tags: ''
    };
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.uploadFile = file;
      if (!this.newRecord.name) {
        this.newRecord.name = file.name.split('.')[0];
      }
    }
  }

  uploadRecord(): void {
    if (!this.uploadFile || !this.newRecord.name) return;

    this.uploading = true;

    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.completeUpload();
      }
    }, 200);
  }

  completeUpload(): void {
    // Add new record to list (Mock implementation)
    const newId = (this.records.length + 1).toString();
    const tags = this.newRecord.tags.split(',').map(t => t.trim()).filter(t => t);

    const record: MedicalRecord = {
      id: newId,
      name: this.newRecord.name,
      type: this.newRecord.type,
      date: this.newRecord.date,
      size: this.formatBytes(this.uploadFile?.size || 0),
      tags: tags.length ? tags : [this.newRecord.type],
      fileName: this.uploadFile?.name,
      // For a real app, this would be a URL from the server/storage
      fileUrl: URL.createObjectURL(this.uploadFile!)
    };

    this.records.unshift(record);
    this.filterRecords();
    this.uploading = false;
    this.closeUploadModal();
  }

  formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  openShareModal(record: MedicalRecord): void {
    this.selectedRecord = record;
    this.showShareModal = true;
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.selectedRecord = null;
  }

  viewRecord(record: MedicalRecord): void {
    // Open record in a new tab or modal viewer
    if (record.fileUrl) {
      // For PDFs and images, open in new tab
      window.open(record.fileUrl, '_blank');
    } else {
      // If no URL, show details in modal
      const dateStr = record.recordDate
        ? record.recordDate instanceof Date
          ? record.recordDate.toLocaleDateString()
          : record.recordDate.toString()
        : record.date || 'N/A';
      const title = record.title || record.name || 'Untitled';
      const type = record.recordType || record.type || 'Unknown';
      alert(`Record Details:\nTitle: ${title}\nType: ${type}\nDate: ${dateStr}`);
    }
  }

  downloadRecord(record: MedicalRecord): void {
    // Download the file if available
    if (record.fileUrl && record.fileName) {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = record.fileUrl;
      link.download = record.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // If no file, download record metadata as JSON
      const title = record.title || record.name || 'record';
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', `${title}_metadata.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  deleteRecord(record: MedicalRecord): void {
    if (confirm(`Are you sure you want to delete "${record.name}"?`)) {
      this.records = this.records.filter((r) => r.id !== record.id);
      this.filterRecords();
    }
  }

  getRecordIcon(type: string): string {
    const icons: Record<string, string> = {
      prescription: 'file-text',
      'lab-report': 'flask',
      vaccination: 'syringe',
      imaging: 'image',
      other: 'file',
    };
    return icons[type] || 'file';
  }
}
