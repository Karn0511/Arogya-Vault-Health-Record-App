import { Injectable } from '@angular/core';
import {
    Auth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    UserCredential,
    signOut as firebaseSignOut
} from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User, UserRole } from '@models/user.model';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class GoogleAuthService {
    private provider: GoogleAuthProvider;

    constructor(
        private auth: Auth,
        private firestore: Firestore
    ) {
        this.provider = new GoogleAuthProvider();
        // Request additional scopes
        this.provider.addScope('profile');
        this.provider.addScope('email');

        // Set custom parameters
        this.provider.setCustomParameters({
            prompt: 'select_account'
        });
    }

    /**
     * Sign in with Google using popup
     */
    signInWithGooglePopup(): Observable<User> {
        return from(signInWithPopup(this.auth, this.provider)).pipe(
            switchMap((credential: UserCredential) => this.handleGoogleUser(credential)),
            catchError((error) => {
                throw this.handleAuthError(error);
            })
        );
    }

    /**
     * Sign in with Google using redirect (better for mobile)
     */
    signInWithGoogleRedirect(): Observable<void> {
        return from(signInWithRedirect(this.auth, this.provider)).pipe(
            catchError((error) => {
                throw this.handleAuthError(error);
            })
        );
    }

    /**
     * Get redirect result after redirect sign-in
     */
    getRedirectResult(): Observable<User | null> {
        return from(getRedirectResult(this.auth)).pipe(
            switchMap((credential) => {
                if (!credential) {
                    return of(null);
                }
                return this.handleGoogleUser(credential);
            }),
            catchError((error) => {
                throw this.handleAuthError(error);
            })
        );
    }

    /**
     * Sign out from Google
     */
    signOut(): Observable<void> {
        return from(firebaseSignOut(this.auth));
    }

    /**
     * Handle Google user credential and create/update user in Firestore
     */
    private handleGoogleUser(credential: UserCredential): Observable<User> {
        const firebaseUser = credential.user;

        if (!firebaseUser) {
            throw new Error('No user found in credential');
        }

        // Extract user information from Google
        const userId = firebaseUser.uid;
        const email = firebaseUser.email || '';
        const fullName = firebaseUser.displayName || '';
        const profileImageUrl = firebaseUser.photoURL || undefined;
        const phone = firebaseUser.phoneNumber || undefined;

        // Check if user exists in Firestore
        return from(getDoc(doc(this.firestore, 'users', userId))).pipe(
            switchMap((docSnap) => {
                if (docSnap.exists()) {
                    // User exists, return existing user data
                    const userData = docSnap.data() as User;
                    return of({
                        ...userData,
                        id: userId,
                        lastLoginAt: new Date()
                    });
                } else {
                    // New user, create user document
                    const newUser: User = {
                        id: userId,
                        email,
                        fullName,
                        role: UserRole.PATIENT, // Default role for Google sign-in
                        profileImageUrl,
                        phone,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        lastLoginAt: new Date()
                    };

                    // Save to Firestore
                    return from(setDoc(doc(this.firestore, 'users', userId), {
                        ...newUser,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        lastLoginAt: serverTimestamp()
                    })).pipe(
                        map(() => newUser)
                    );
                }
            })
        );
    }

    /**
     * Get additional user info from Google credential
     */
    getGoogleUserInfo(credential: UserCredential): {
        accessToken?: string;
        idToken?: string;
        providerId: string;
    } {
        const googleCredential = GoogleAuthProvider.credentialFromResult(credential);

        return {
            accessToken: googleCredential?.accessToken,
            idToken: googleCredential?.idToken,
            providerId: googleCredential?.providerId || 'google.com'
        };
    }

    /**
     * Link existing account with Google
     */
    linkWithGoogle(currentUser: unknown): Observable<UserCredential> {
        return from(signInWithPopup(this.auth, this.provider)).pipe(
            catchError((error) => {
                throw this.handleAuthError(error);
            })
        );
    }

    /**
     * Handle authentication errors
     */
    private handleAuthError(error: { code?: string; message?: string }): Error {
        let message = 'An error occurred during authentication';

        switch (error.code) {
            case 'auth/popup-closed-by-user':
                message = 'Sign-in popup was closed before completing';
                break;
            case 'auth/popup-blocked':
                message = 'Sign-in popup was blocked by the browser';
                break;
            case 'auth/cancelled-popup-request':
                message = 'Sign-in was cancelled';
                break;
            case 'auth/account-exists-with-different-credential':
                message = 'An account already exists with the same email but different sign-in credentials';
                break;
            case 'auth/invalid-credential':
                message = 'The credential is invalid or has expired';
                break;
            case 'auth/operation-not-allowed':
                message = 'Google sign-in is not enabled';
                break;
            case 'auth/unauthorized-domain':
                message = 'This domain is not authorized for OAuth operations';
                break;
            case 'auth/network-request-failed':
                message = 'Network error occurred. Please check your connection';
                break;
            default:
                message = error.message || message;
        }

        return new Error(message);
    }

    /**
     * Check if user is signed in with Google
     */
    isGoogleUser(): boolean {
        const user = this.auth.currentUser;
        return user?.providerData.some(provider => provider.providerId === 'google.com') || false;
    }

    /**
     * Get current Firebase user
     */
    getCurrentFirebaseUser() {
        return this.auth.currentUser;
    }
}
