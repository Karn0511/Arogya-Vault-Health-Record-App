import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { User, UserRole, CreateUserDto, Gender } from '@models/user.model';
import { Router } from '@angular/router';
import { GoogleAuthService } from './cognito-google-auth.service';
import { environment } from '@environments/environment';

/**
 * Authentication Service
 * CONNECTS TO LOCAL MONGODB BACKEND (Example: http://localhost:5000)
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private googleAuthService = inject(GoogleAuthService);

  private API_URL = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchCurrentUser(token).subscribe();
    }
  }

  private fetchCurrentUser(token: string): Observable<User> {
    return this.http.get<any>(`${this.API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      map(response => {
        const user = this.mapBackendUserToModel(response.user);
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(() => {
        this.signOut();
        return of(null as any);
      })
    );
  }

  /**
   * Get Current User
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  get userRole(): UserRole | null {
    return this.currentUserValue?.role || null;
  }

  /**
   * Login with Email/Password
   */
  /**
 * Login with Email/Password
 */
  signIn(email: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.API_URL}/login`, { email, password }).pipe(
      map(response => {
        const user = this.mapBackendUserToModel(response.user);
        this.saveSession(user, response.token);
        return user;
      })
    );
  }

  /**
   * Verify OTP and login
   */
  verifyOtp(phone: string, otp: string, sessionId: string, countryCode = '+91', name?: string): Observable<User> {
    return this.http.post<any>(`${this.API_URL}/verify-otp`, { phone, otp, sessionId, countryCode, name }).pipe(
      map(response => {
        const user = this.mapBackendUserToModel(response.user);
        this.saveSession(user, response.token);
        return user;
      })
    );
  }

  /**
   * Verify OTP and Sign Up
   */
  verifyOtpAndSignup(phone: string, otp: string, sessionId: string): Observable<User> {
    return this.http.post<any>(`${this.API_URL}/verify-otp-signup`, { phone, otp, sessionId }).pipe(
      map(response => {
        const user = this.mapBackendUserToModel(response.user);
        this.saveSession(user, response.token);
        return user;
      })
    );
  }

  /**
   * Sign In with Google
   */
  signInWithGoogle(): Observable<User> {
    return this.googleAuthService.signInWithGoogle().pipe(
      switchMap((googleUser: User) => {
        const token = sessionStorage.getItem('google_id_token');
        if (!token) return throwError(() => new Error('Google Token not found'));
        return this.http.post<any>(`${this.API_URL}/google`, { token }).pipe(
          catchError(err => throwError(() => err))
        );
      }),
      map(response => {
        const user = this.mapBackendUserToModel(response.user);
        this.saveSession(user, response.token);
        return user;
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Sign Up (Register with Email/Password)
   */
  signUp(dto: CreateUserDto): Observable<User> {
    return this.http.post<any>(`${this.API_URL}/register`, dto).pipe(
      map(response => {
        const user = this.mapBackendUserToModel(response.user);
        this.saveSession(user, response.token);
        return user;
      })
    );
  }

  /**
   * Navigates the user to their respective dashboard based on their role.
   */
  public navigateByRole(role: UserRole): void {
    switch (role) {
      case UserRole.PATIENT:
        this.router.navigate(['/patient/dashboard']);
        break;
      case UserRole.DOCTOR:
        this.router.navigate(['/doctor/dashboard']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  /**
   * Confirm Sign Up (Dummy implementation for now)
   */
  confirmSignUp(email: string, code: string): Observable<any> {
    return of({ success: true });
  }

  /**
   * Resend Confirmation Code (Dummy implementation)
   */
  resendConfirmationCode(email: string): Observable<any> {
    return of({ success: true });
  }

  getAccessToken(): Observable<string | null> {
    return of(localStorage.getItem('token'));
  }

  /**
   * Request OTP
   */
  sendOtp(phone: string, countryCode = '+91'): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/send-otp`, { phone, countryCode });
  }

  /**
   * Sign Out
   */
  signOut(): Observable<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('google_id_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
    return of(void 0);
  }

  /**
   * Helper: Map Backend User to Frontend Model
   */
  private mapBackendUserToModel(backendUser: any): User {
    return {
      id: backendUser._id || backendUser.id,
      email: backendUser.email,
      fullName: backendUser.fullName,
      role: backendUser.role as UserRole,
      phone: backendUser.phone || backendUser.phoneNumber,
      profileImageUrl: backendUser.profilePicture || backendUser.profileImageUrl,
      gender: backendUser.gender as Gender,
      dateOfBirth: backendUser.dateOfBirth ? new Date(backendUser.dateOfBirth) : undefined,
      uhid: backendUser.uhid,
      address: backendUser.address,
      createdAt: backendUser.createdAt ? new Date(backendUser.createdAt) : new Date(),
      updatedAt: backendUser.updatedAt ? new Date(backendUser.updatedAt) : new Date()
    };
  }

  /**
   * Helper: Save Session
   */
  private saveSession(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.navigateByRole(user.role);
  }

  /**
   * Helper: Get User from Local Storage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
}
