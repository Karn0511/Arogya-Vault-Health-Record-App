import { Injectable, NgZone } from '@angular/core';
import { User, UserRole, Gender } from '@models/user.model';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';


declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  // Google OAuth Configuration
  private googleClientId =
    '129321365934-u9dtakh760j7sck8n2iod9e8rkemkt0t.apps.googleusercontent.com';

  constructor(
    private ngZone: NgZone
  ) {
    this.initializeGoogleSDK();
  }

  /**
   * Initialize Google Sign-In SDK
   */
  private initializeGoogleSDK(): void {
    if (typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  /**
   * Sign in with Google using Token Model (Reliable Popup)
   */
  signInWithGoogle(): Observable<User> {
    return new Observable((observer) => {
      this.ngZone.run(() => {
        if (!window.google) {
          observer.error(new Error('Google SDK not loaded. Please wait or refresh.'));
          return;
        }

        try {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.googleClientId,
            scope: 'email profile openid',
            callback: (tokenResponse: any) => {
              if (tokenResponse && tokenResponse.access_token) {
                this.fetchGoogleUserProfile(tokenResponse.access_token, observer);
              } else {
                observer.error(new Error('Google Sign-In was cancelled or failed'));
              }
            },
            error_callback: (err: unknown) => {
              observer.error(new Error('Google Sign-In Error occurred'));
            }
          });

          // Trigger the popup
          tokenClient.requestAccessToken();

        } catch (error) {
          observer.error(error);
        }
      });
    }).pipe(
      switchMap((user: any) => {
        return from(Promise.resolve(user));
      })
    );
  }

  /**
   * Fetch User Profile from Google
   */
  private async fetchGoogleUserProfile(accessToken: string, observer: any) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const payload = await response.json();

      const mockUser: User = {
        id: payload.sub,
        email: payload.email,
        fullName: payload.name,
        phone: '',
        role: UserRole.PATIENT,
        gender: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      };

      sessionStorage.setItem('google_id_token', accessToken); // Store access token for now
      sessionStorage.setItem('google_user', JSON.stringify(mockUser));

      this.ngZone.run(() => {
        observer.next(mockUser);
        observer.complete();
      });

    } catch (error) {
      this.ngZone.run(() => {
        observer.error(error);
      });
    }
  }

  /**
   * Link Google account to existing Cognito user
   */
  linkGoogleAccount(googleToken: string): Observable<User> {
    return from(Promise.resolve({} as User)); // Placeholder
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): Error {
    return new Error(error.message || 'Google Auth Failed');
  }
}
