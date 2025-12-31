import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface FileUploadData {
  _id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  fileCategory: string;
  description?: string;
  uploadedAt: string;
  metadata: {
    accessCount: number;
  };
}

export interface UploadProgressEvent {
  progress: number;
  fileName: string;
}

export interface PresignedUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    s3Key: string;
    bucketName: string;
  };
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    fileStorageId: string;
    fileUrl: string;
    s3Key: string;
    originalName: string;
  };
}

export interface FileListResponse {
  success: boolean;
  data: FileUploadData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StorageStatsResponse {
  success: boolean;
  data: {
    totalFiles: number;
    totalSize: number;
    byCategory: Array<{
      _id: string;
      count: number;
      totalSize: number;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.apiUrl}/files`;
  private uploadProgress$ = new BehaviorSubject<UploadProgressEvent | null>(null);
  private files$ = new BehaviorSubject<FileUploadData[]>([]);

  constructor(private http: HttpClient) {}

  // Get presigned URL for upload
  getPresignedUploadUrl(fileName: string, fileType: string): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(
      `${this.apiUrl}/presigned-url`,
      { fileName, fileType }
    );
  }

  // Upload file using presigned URL
  uploadFileToPresignedUrl(presignedUrl: string, file: File): Observable<HttpEvent<unknown>> {
    const headers = new HttpHeaders({
      'Content-Type': file.type
    });

    return this.http.put(presignedUrl, file, {
      headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap((event: HttpEvent<unknown>) => {
        if (event.type === 1 && 'loaded' in event && 'total' in event && event.loaded && event.total) { // HttpProgressEvent
          const progress = Math.round((event.loaded / event.total) * 100);
          this.uploadProgress$.next({
            progress,
            fileName: file.name
          });
        }
      })
    );
  }

  // Direct file upload to backend
  uploadFile(
    file: File,
    category: string = 'OTHER',
    description: string = '',
    appointmentId?: string,
    reportId?: string
  ): Observable<HttpEvent<{ success?: boolean }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileCategory', category);
    formData.append('description', description);
    if (appointmentId) formData.append('relatedAppointmentId', appointmentId);
    if (reportId) formData.append('relatedReportId', reportId);

    return this.http.post<{ success?: boolean }>(
      `${this.apiUrl}/upload`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      tap((event: HttpEvent<{ success?: boolean }>) => {
        if (event.type === 1 && 'loaded' in event && 'total' in event && event.loaded && event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);
          this.uploadProgress$.next({
            progress,
            fileName: file.name
          });
        } else if (event.type === 4 && 'body' in event && event.body?.success) {
          this.loadUserFiles();
        }
      })
    );
  }

  // Get all user files
  getUserFiles(
    category?: string,
    page: number = 1,
    limit: number = 10
  ): Observable<FileListResponse> {
    let url = `${this.apiUrl}/my-files?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;

    return this.http.get<FileListResponse>(url).pipe(
      tap(response => {
        if (response.success) {
          this.files$.next(response.data);
        }
      })
    );
  }

  // Get file by ID
  getFile(fileId: string): Observable<{ success: boolean; data: FileUploadData }> {
    return this.http.get<{ success: boolean; data: FileUploadData }>(`${this.apiUrl}/${fileId}`);
  }

  // Delete file
  deleteFile(fileId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${fileId}`).pipe(
      tap(response => {
        if (response.success) {
          this.loadUserFiles();
        }
      })
    );
  }

  // Archive file
  archiveFile(fileId: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${fileId}/archive`, {}).pipe(
      tap(response => {
        if (response.success) {
          this.loadUserFiles();
        }
      })
    );
  }

  // Get storage statistics
  getStorageStats(): Observable<StorageStatsResponse> {
    return this.http.get<StorageStatsResponse>(`${this.apiUrl}/stats/summary`);
  }

  // Load user files
  private loadUserFiles(): void {
    this.getUserFiles().subscribe();
  }

  // Get upload progress observable
  getUploadProgress(): Observable<UploadProgressEvent | null> {
    return this.uploadProgress$.asObservable();
  }

  // Get files observable
  getFiles(): Observable<FileUploadData[]> {
    return this.files$.asObservable();
  }

  // Validate file
  validateFile(file: File, maxSize: number = 50 * 1024 * 1024): { valid: boolean; error?: string } {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed. Allowed: JPG, PNG, GIF, PDF, DOC, DOCX'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`
      };
    }

    return { valid: true };
  }

  // Get file category icon
  getFileIcon(fileType: string): string {
    const iconMap: { [key: string]: string } = {
      'jpg': '📷',
      'jpeg': '📷',
      'png': '📷',
      'gif': '🎬',
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'txt': '📋',
      'other': '📦'
    };
    return iconMap[fileType] || '📦';
  }
}
