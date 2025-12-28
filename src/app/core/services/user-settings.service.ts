import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '@environments/environment';

export interface UserProfileResponse {
  success: boolean;
  user: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    autoDeletionDays?: number;
    lastActivityAt?: string;
    updatedAt?: string;
    createdAt?: string;
  };
}

export interface AutoDeletionOption {
  value: number;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/user';

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.baseUrl}/profile`);
  }

  updateAutoDeletion(days: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.baseUrl}/auto-deletion`, { days });
  }

  getAutoDeletionOptions(): Observable<AutoDeletionOption[]> {
    return this.http.get<AutoDeletionOption[]>(`${this.baseUrl}/auto-deletion-options`);
  }

  deleteAccount(confirmText: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/account`, {
      body: { confirmText },
    });
  }

  loadProfileWithOptions() {
    return forkJoin({ profile: this.getProfile(), options: this.getAutoDeletionOptions() });
  }
}
