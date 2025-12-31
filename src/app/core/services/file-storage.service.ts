import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface FileUploadRequest {
  file: File;
  fileCategory: 'MEDICAL_REPORT' | 'PRESCRIPTION' | 'LAB_RESULT' | 'INSURANCE' | 'OTHER';
  description?: string;
  relatedAppointmentId?: string;
  relatedReportId?: string;
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

export interface UploadHistory {
  _id: string;
  importType: string;
  sourceProvider: string;
  status: string;
  dataImported: {
    fileId: string;
    fileName: string;
    fileSize: number;
    uploadedAt: Date;
  };
  createdAt: Date;
}

export interface FileStorageItem {
  _id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  fileCategory: string;
  description?: string;
  uploadedAt: Date;
}

export interface FileListResponse {
  success: boolean;
  files: FileStorageItem[];
  total: number;
  page: number;
  pages: number;
}

export interface PresignedUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    s3Key: string;
    bucketName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FileStorageService {
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {}

  /**
   * Upload file to S3 with metadata
   * @param request File upload request
   * @returns Observable of upload response with progress
   */
  uploadFile(request: FileUploadRequest): Observable<{ progress: number; response?: FileUploadResponse }> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('fileCategory', request.fileCategory);

    if (request.description) {
      formData.append('description', request.description);
    }
    if (request.relatedAppointmentId) {
      formData.append('relatedAppointmentId', request.relatedAppointmentId);
    }
    if (request.relatedReportId) {
      formData.append('relatedReportId', request.relatedReportId);
    }

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((100 * event.loaded) / event.total);
          return { progress };
        } else if (event.type === HttpEventType.Response) {
          return { progress: 100, response: event.body as FileUploadResponse };
        }
        return { progress: 0 };
      })
    );
  }

  /**
   * Get presigned URL for direct S3 upload
   * @param fileName File name
   * @param fileType MIME type
   * @returns Observable of presigned URL response
   */
  getPresignedUrl(fileName: string, fileType: string): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(`${this.apiUrl}/presigned-url`, {
      fileName,
      fileType
    });
  }

  /**
   * Get all uploaded files for current user
   * @param category Optional file category filter
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Observable of file list response
   */
  getMyFiles(category?: string, page: number = 1, limit: number = 10): Observable<FileListResponse> {
    let url = `${this.apiUrl}/my-files?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    return this.http.get<FileListResponse>(url);
  }

  /**
   * Get upload history
   * @returns Observable of upload history array
   */
  getUploadHistory(): Observable<{ success: boolean; history: UploadHistory[] }> {
    return this.http.get<{ success: boolean; history: UploadHistory[] }>(`${this.apiUrl}/upload-history`);
  }

  /**
   * Delete a file
   * @param fileId File ID to delete
   * @returns Observable of delete response
   */
  deleteFile(fileId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${fileId}`);
  }

  /**
   * Format file size for display
   * @param bytes File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file icon based on file type
   * @param fileType File extension or MIME type
   * @returns Icon class name
   */
  getFileIcon(fileType: string): string {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'fa-file-pdf text-red-600';
    if (type.includes('doc')) return 'fa-file-word text-blue-600';
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
      return 'fa-file-image text-green-600';
    }
    return 'fa-file text-gray-600';
  }
}
