import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

interface CarouselSlide {
    title: string;
    description: string;
}

@Component({
    selector: 'app-doctor-login',
    templateUrl: './doctor-login.component.html',
    styleUrls: ['./doctor-login.component.scss'],
})
export class DoctorLoginComponent implements OnInit, OnDestroy {
    loginForm!: FormGroup;
    isLoading = false;
    showPassword = false;
    error = signal<string>('');
    activeIndex = 0;

    carouselData: CarouselSlide[] = [
        {
            title: 'Streamlined Practice.',
            description:
                'Manage your appointments, patient records, and prescriptions in one unified, efficient interface.',
        },
        {
            title: 'Clinical Decision Support.',
            description:
                'Access AI-driven insights and analytics to support your diagnostic and treatment decisions.',
        },
        {
            title: 'Secure Communication.',
            description:
                'Connect with your patients securely and provide timely advice and follow-ups.',
        },
        {
            title: 'Comprehensive History.',
            description:
                'View complete patient medical histories at a glance to provide better, more informed care.',
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
            email: ['doctor@health.com', [Validators.required, Validators.email]],
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

        this.authService.signIn(email, password).subscribe({
            next: () => {
                this.isLoading = false;
                // Navigation is handled by AuthService
            },
            error: (err) => {
                this.isLoading = false;
                let errorMessage = 'Invalid credentials. Please try again.';

                if (err.code === 'auth/user-not-found') {
                    errorMessage = 'No account found. Please contact administration.';
                } else if (err.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password. Please try again.';
                } else if (err.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email format.';
                } else if (err.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many failed attempts. Please try again later.';
                } else if (err.message) {
                    errorMessage = err.message;
                }

                this.error.set(errorMessage);
            },
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    setSlide(index: number): void {
        this.activeIndex = index;
    }

    goBack() {
        this.router.navigate(['/auth']);
    }

    goToForgotPassword(): void {
        // Redirect to the main login page where account recovery will live
        this.router.navigate(['/auth/login'], { queryParams: { mode: 'password' } });
    }
}
