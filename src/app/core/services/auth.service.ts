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
  signIn(email: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.API_URL}/login`, { email, password }).pipe(
      map(response => {
        const user = this.mapBackendUserToModel(response.user);
        this.saveSession(user, response.token);
        return user;
      }),
      tap(user => this.navigateByRole(user.role))
    );
  }

  /**
   * Send OTP to phone
   */
  sendOtp(phone: string, countryCode = '+91'): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/send-otp`, { phone, countryCode });
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
      }),
      tap(user => this.navigateByRole(user.role))
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
      }),
      tap(user => this.navigateByRole(user.role))
    );
  }

  /**
   * Sign In with Google
   * 1. Get Access Token from Google SDK
   * 2. Send to Backend
   */
  signInWithGoogle(): Observable<User> {
    return this.googleAuthService.signInWithGoogle().pipe(
      switchMap((googleUser: User) => {
        // Google user received successfully
        const token = sessionStorage.getItem('google_id_token');
        if (!token) {
          console.error('Google Token not found in session storage');
          return throwError(() => new Error('Google Token not found'));
        }

        // Verify with Backend
        console.log('Sending Google token to backend for verification...');
        return this.http.post<any>(`${this.API_URL}/google`, { token }).pipe(
          catchError(err => {
            console.error('Backend Google auth failed:', err);
            return throwError(() => err);
          })
        );
      }),
      map(response => {
        console.log('Backend response received:', response);
        const user = this.mapBackendUserToModel(response.user);
        this.saveSession(user, response.token);
        console.log('User session saved, navigating...');
        return user;
      }),
      tap(user => {
        console.log('Navigating user by role:', user.role);
        this.navigateByRole(user.role);
      }),
      catchError(err => {
        console.error('Google sign-in error:', err);
        return throwError(() => err);
      })
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
      }),
      tap(user => this.navigateByRole(user.role))
    );
  }

  /**
   * Sign Out
   */
  signOut(): Observable<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
    return of(void 0);
  }

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------

  private saveSession(user: User, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  private mapBackendUserToModel(backendUser: Record<string, unknown>): User {
    // Map backend response to Frontend User Model
    const role = (backendUser.role as string)?.toUpperCase() as UserRole || UserRole.PATIENT;

    return {
      id: (backendUser.id || backendUser._id) as string,
      email: (backendUser.email as string) || '',
      fullName: (backendUser.fullName as string) || (backendUser.name as string) || 'User',
      role: role,
      phone: backendUser.phone as string | undefined,
      gender: backendUser.gender as Gender | undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    };
  }

  private navigateByRole(role: UserRole): void {
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
}
