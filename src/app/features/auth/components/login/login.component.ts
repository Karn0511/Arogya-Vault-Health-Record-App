import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@models/user.model';

interface CarouselSlide {
  title: string;
  description: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  otpForm!: FormGroup;
  isLoading = false;
  isOtpLoading = false;
  isGoogleLoading = false;
  isBootingApp = false;
  bootProgress = 0;
  showPassword = false;
  error = signal<string>('');
  otpError = signal<string>('');
  otpMessage = signal<string>('');
  activeIndex = 0;
  isMenuOpen = false;
  authMode: 'password' | 'otp' = 'password';
  otpSessionId: string | null = null;
  otpStep: 'start' | 'codeSent' = 'start';

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
    private router: Router,
    private route: ActivatedRoute
  ) { }

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['admin@health.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    this.otpForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,14}$/)]],
      countryCode: ['+91', [Validators.required]],
      otp: ['', [Validators.minLength(4), Validators.maxLength(6)]],
      name: ['']
    });

    // Auto-advance carousel
    this.intervalId = setInterval(() => {
      this.activeIndex = (this.activeIndex + 1) % this.carouselData.length;
    }, 5000);

    this.route.queryParamMap.subscribe((params) => {
      const mode = params.get('mode');
      if (mode === 'otp') {
        this.onToggleAuthMode('otp');
      } else {
        this.onToggleAuthMode('password');
      }
    });
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
      next: (user) => {
        this.isLoading = false;
        this.showBootingScreen(user.role);
      },
      error: (err) => {
        this.isLoading = false;
        let errorMessage = 'Invalid credentials. Please try again.';

        if (err.error && err.error.message) {
          errorMessage = err.error.message;
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

  private showBootingScreen(role: UserRole): void {
    this.isBootingApp = true;
    this.bootProgress = 0;

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      if (this.bootProgress < 100) {
        this.bootProgress += Math.random() * 20;
        if (this.bootProgress > 100) {
          this.bootProgress = 100;
        }
      } else {
        clearInterval(progressInterval);
        // Navigate after 2 seconds
        setTimeout(() => {
          this.isBootingApp = false;
          this.authService.navigateByRole(role);
        }, 1500);
      }
    }, 200);
  }

  onSendOtp(): void {
    if (this.otpForm.get('phone')?.invalid) {
      this.otpForm.get('phone')?.markAsTouched();
      return;
    }

    this.isOtpLoading = true;
    this.otpError.set('');
    this.otpMessage.set('');

    const phone = this.otpForm.get('phone')?.value;
    const countryCode = this.otpForm.get('countryCode')?.value || '+91';

    this.authService.sendOtp(phone, countryCode).subscribe({
      next: (response) => {
        this.isOtpLoading = false;
        this.otpSessionId = response.sessionId;
        this.otpStep = 'codeSent';
        const mockHint = response.mockOTP ? ` (Test OTP: ${response.mockOTP})` : '';
        this.otpMessage.set(`${response.message || 'OTP sent successfully'}${mockHint}`);
      },
      error: (err) => {
        this.isOtpLoading = false;
        const message = err.error?.error || err.error?.message || err.message || 'Failed to send OTP';
        this.otpError.set(message);
      }
    });
  }

  onVerifyOtp(): void {
    if (this.otpForm.invalid || !this.otpSessionId) {
      this.otpForm.markAllAsTouched();
      this.otpError.set(!this.otpSessionId ? 'Please request an OTP first.' : 'Enter a valid OTP');
      return;
    }

    this.isOtpLoading = true;
    this.otpError.set('');

    const { phone, otp, countryCode, name } = this.otpForm.value;

    this.authService.verifyOtp(phone, otp, this.otpSessionId, countryCode, name).subscribe({
      next: (user) => {
        this.isOtpLoading = false;
        this.otpMessage.set('Verified! Logging in...');
        this.showBootingScreen(user.role);
      },
      error: (err) => {
        this.isOtpLoading = false;
        const message = err.error?.error || err.error?.message || err.message || 'OTP verification failed';
        this.otpError.set(message);
      }
    });
  }

  onGoogleLogin(): void {
    this.isLoading = true;
    this.error.set('');

    // Try to sign in with Google
    this.authService.signInWithGoogle().subscribe({
      next: (user) => {
        this.isLoading = false;
        this.showBootingScreen(user.role);
      },
      error: (err) => {
        this.isLoading = false;
        this.error.set(err.message || 'Google Sign-In failed');
      }
    });
  }

  onMobileLogin(): void {
    this.authMode = 'otp';
    this.error.set('');
    // Reset OTP form for fresh login
    this.otpStep = 'start';
    this.otpSessionId = null;
    this.otpMessage.set('');
    this.otpError.set('');
  }

  switchToPasswordLogin(): void {
    this.authMode = 'password';
    this.error.set('');
  }

  onAadhaarLogin(): void {
    // Coming soon functionality
    alert('🔒 Aadhaar Login feature is currently under development.\n\nFor testing, use:\nEmail: patient@health.com\nPassword: password123');
  }

  goToForgotPassword(): void {
    // Redirect to signup for now; dedicated reset flow can hook in later
    this.router.navigate(['/auth/signup']);
  }

  onToggleAuthMode(mode: 'password' | 'otp'): void {
    this.authMode = mode;
    this.error.set('');
    this.otpError.set('');
    this.otpMessage.set('');

    if (mode === 'otp') {
      this.otpForm.get('phone')?.markAsPristine();
    }
  }

  setSlide(index: number): void {
    this.activeIndex = index;
  }
}
