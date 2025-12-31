import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CreateUserDto, User, UserRole } from '@models/user.model';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

// Internal interface for storing users with passwords (mock auth only)
interface StoredUser extends User {
    password: string;
}

@Injectable({
    providedIn: 'root',
})
export class MockAuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private readonly STORAGE_KEY = 'mock_users';
    private readonly CURRENT_USER_KEY = 'mock_current_user';

    constructor(private router: Router) {
        const savedUser = localStorage.getItem(this.CURRENT_USER_KEY);
        if (savedUser) {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
        this.initializeDefaultUsers();
    }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    get isAuthenticated(): boolean {
        return this.currentUserValue !== null;
    }

    get userRole(): UserRole | null {
        return this.currentUserValue?.role || null;
    }

    private initializeDefaultUsers(): void {
        const users = this.getUsers();
        if (users.length === 0) {
            const defaultUsers: StoredUser[] = [
                {
                    id: '1',
                    email: 'patient@health.com',
                    password: 'password123',
                    fullName: 'Test Patient',
                    role: UserRole.PATIENT,
                    phone: '1234567890',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: '2',
                    email: 'doctor@health.com',
                    password: 'password123',
                    fullName: 'Dr. Smith',
                    role: UserRole.DOCTOR,
                    phone: '0987654321',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: '3',
                    email: 'admin@health.com',
                    password: 'password123',
                    fullName: 'Admin User',
                    role: UserRole.ADMIN,
                    phone: '1122334455',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultUsers));
        }
    }

    private getUsers(): StoredUser[] {
        const users = localStorage.getItem(this.STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    }

    private saveUsers(users: StoredUser[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    }

    signUp(dto: CreateUserDto): Observable<User> {
        return of(null).pipe(
            delay(500),
            switchMap(() => {
                const users = this.getUsers();

                if (users.find((u: User) => u.email === dto.email)) {
                    return throwError((err: any) => ({ code: 'auth/email-already-in-use', message: 'Email already in use' }));
                }

                const newUser: StoredUser = {
                    id: Date.now().toString(),
                    email: dto.email,
                    password: dto.password,
                    fullName: dto.fullName,
                    role: dto.role,
                    phone: dto.phone,
                    gender: dto.gender,
                    dateOfBirth: dto.dateOfBirth,
                    doctorDetails: dto.doctorDetails as any,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                users.push(newUser);
                this.saveUsers(users);

                // Return user without password
                const { password, ...userWithoutPassword } = newUser;
                this.currentUserSubject.next(userWithoutPassword);
                localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

                this.navigateByRole(userWithoutPassword.role);

                return of(userWithoutPassword);
            })
        );
    }

    signIn(email: string, password: string): Observable<User> {
        return of(null).pipe(
            delay(500),
            switchMap(() => {
                const users = this.getUsers();
                const user: StoredUser | undefined = users.find((u: StoredUser) => u.email === email && u.password === password);

                if (!user) {
                    return throwError((err: any) => ({
                        code: 'auth/user-not-found',
                        message: 'Invalid email or password'
                    }));
                }

                // Remove password before storing/returning
                const { password: _, ...userWithoutPassword } = user;

                this.currentUserSubject.next(userWithoutPassword);
                localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

                this.navigateByRole(user.role);

                return of(userWithoutPassword);
            })
        );
    }

    signOut(): Observable<void> {
        this.currentUserSubject.next(null);
        localStorage.removeItem(this.CURRENT_USER_KEY);
        this.router.navigate(['/auth/login']);
        return of(void 0);
    }

    resetPassword(email: string): Observable<void> {
        return of(void 0).pipe(delay(500));
    }

    updateUserProfile(updates: Partial<User>): Observable<User> {
        return of(null).pipe(
            delay(500),
            switchMap(() => {
                const currentUser = this.currentUserValue;
                if (!currentUser) {
                    return throwError((err: any) => new Error('No user logged in'));
                }

                const users = this.getUsers();
                const userIndex = users.findIndex((u: any) => u.id === currentUser.id);

                if (userIndex === -1) {
                    return throwError((err: any) => new Error('User not found'));
                }

                const updatedUser = { ...users[userIndex], ...updates, updatedAt: new Date() };
                users[userIndex] = updatedUser;
                this.saveUsers(users);

                const userWithoutPassword = { ...updatedUser };
                delete (userWithoutPassword as any).password;

                this.currentUserSubject.next(userWithoutPassword);
                localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

                return of(userWithoutPassword);
            })
        );
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
}
