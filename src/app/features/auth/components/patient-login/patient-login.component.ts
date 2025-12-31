import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface CarouselSlide {
    title: string;
    description: string;
}

@Component({
    selector: 'app-patient-login',
    templateUrl: './patient-login.component.html',
    styleUrls: ['./patient-login.component.scss'],
})
export class PatientLoginComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    loginForm!: FormGroup;
    isLoading = false;
    isGoogleLoading = false;
    showPassword = false;
    error = signal<string>('');
    activeIndex = 0;

    carouselData: CarouselSlide[] = [
        {
            title: 'Your Health, Unified.',
            description:
                'Securely store and manage all your health records, from lab reports to prescriptions, in one intelligent vault.',
        },
        {
            title: 'AI-Powered Insights.',
            description:
                'Let our advanced AI analyze your documents, summarize key findings, and answer your health questions with clarity.',
        },
        {
            title: 'Track Your Vitals.',
            description:
                'Easily log and monitor key health metrics like blood pressure, glucose levels, and heart rate over time.',
        },
        {
            title: 'Medication Reminders.',
            description:
                'Never miss a dose again. Get smart reminders for your medications and track your adherence effortlessly.',
        },
        {
            title: 'Always In Your Control.',
            description:
                'Your data is yours. We provide the tools to understand it, but you always have full ownership and control.',
        },
    ];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    private intervalId: ReturnType<typeof setInterval> | null = null;

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            email: ['patient@health.com', [Validators.required, Validators.email]],
            password: ['password123', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false],
        });

        // Auto-advance carousel
        this.intervalId = setInterval(() => {
            this.activeIndex = (this.activeIndex + 1) % this.carouselData.length;
        }, 5000);
    }

    ngOnDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.destroy$.next();
        this.destroy$.complete();
    }

    get currentSlide(): CarouselSlide {
        return this.carouselData[this.activeIndex];
    }

    onLogin(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.error.set('');

        const { email, password } = this.loginForm.value;

        this.authService.signIn(email, password)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.isLoading = false;
                    // Navigation is handled by AuthService
                },
                error: (err: unknown) => {
                    this.isLoading = false;
                    let errorMessage = 'Invalid credentials. Please try again.';
                    const error = err as { code?: string; message?: string };

                    if (error.code === 'auth/user-not-found') {
                        errorMessage = 'No account found. Please create an account first.';
                    } else if (error.code === 'auth/wrong-password') {
                        errorMessage = 'Incorrect password. Please try again.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email format.';
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMessage = 'Too many failed attempts. Please try again later.';
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    this.error.set(errorMessage);
                },
            });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onGoogleSignIn(): void {
        this.isGoogleLoading = true;
        this.error.set('');

        this.authService.signInWithGoogle()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.isGoogleLoading = false;
                    // Navigation is handled by AuthService
                },
                error: (err: unknown) => {
                    this.isGoogleLoading = false;
                    const error = err as { message?: string };
                    this.error.set(error.message || 'Google sign-in failed. Please try again.');
                },
            });
    }

    onMobileLogin(): void {
        // Redirect to the main login screen with OTP mode for now
        this.router.navigate(['/auth/login'], { queryParams: { mode: 'otp' } });
    }

    setSlide(index: number): void {
        this.activeIndex = index;
    }

    goBack() {
        this.router.navigate(['/auth']);
    }

    goToForgotPassword(): void {
        // Route to the main login page where account recovery will live
        this.router.navigate(['/auth/login'], { queryParams: { mode: 'password' } });
    }
}
