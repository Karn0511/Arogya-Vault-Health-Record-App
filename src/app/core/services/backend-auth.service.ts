import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BackendLoginRequest {
  email: string;
  password: string;
}

export interface BackendRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  role: string;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackendAuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Login with backend API
   */
  login(email: string, password: string): Observable<BackendAuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password
    });
  }

  /**
   * Register with backend API
   */
  register(userData: BackendRegisterRequest): Observable<BackendAuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/auth/register`, userData);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): Observable<{ valid: boolean; user?: unknown }> {
    return this.http.post<{ valid: boolean; user?: unknown }>(`${this.apiUrl}/auth/verify`, { token });
  }

  /**
   * Refresh JWT token
   */
  refreshToken(token: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/refresh`, { token });
  }
}
