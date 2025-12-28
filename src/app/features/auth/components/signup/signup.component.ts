import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CreateUserDto, UserRole } from '@models/user.model';
import { Subject, interval } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  signupForm!: FormGroup;
  otpForm!: FormGroup;
  isLoading = false;
  isGoogleLoading = false;
  otpSendLoading = false;
  otpResendLoading = false;
  error: string | null = null;
  step = 1; // Multi-step form
  showPassword = false;
  showConfirmPassword = false;
  signupMode: 'email' | 'otp' = 'email'; // Email or OTP signup
  otpSessionId: string | null = null;
  otpSent = false;
  otpResendTimer = 0;
  maskedPhone = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]],
      role: [UserRole.PATIENT, [Validators.required]],
      agreeTerms: [false, [Validators.requiredTrue]],
    }, { validators: this.passwordMatchValidator });

    // OTP form for signup via mobile
    this.otpForm = this.fb.group({
      mobilePhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      otp0: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      otp1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      otp2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      otp3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      otp4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      otp5: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]]
    });
  }

  // Custom validator for password strength
  private passwordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  // Custom validator to check if passwords match
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    if (this.signupForm.hasError('passwordMismatch')) {
      this.error = 'Passwords do not match';
      return;
    }

    const { confirmPassword, agreeTerms, ...userData } = this.signupForm.value;
    this.isLoading = true;
    this.error = null;

    const createUserDto: CreateUserDto = {
      ...userData,
      role: userData.role || UserRole.PATIENT
    };

    this.authService.signUp(createUserDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          // Navigation handled by AuthService
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.error = this.getErrorMessage(err);
        },
      });
  }

  // Handle Google Sign In
  onGoogleSignIn(): void {
    this.isGoogleLoading = true;
    this.error = null;

    this.authService.signInWithGoogle()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isGoogleLoading = false;
          // Navigation is handled by AuthService.navigateByRole()
        },
        error: (err: unknown) => {
          this.isGoogleLoading = false;
          this.error = this.getErrorMessage(err);
        }
      });
  }

  // Switch to OTP signup mode
  switchToMobileOtp(): void {
    this.signupMode = 'otp';
    this.error = null;
    this.otpSent = false;
    this.resetOtpForm();
  }

  // Switch back to email signup
  switchToEmailSignup(): void {
    this.signupMode = 'email';
    this.error = null;
  }

  // Reset OTP form
  resetOtpForm(): void {
    this.otpForm.reset();
    this.otpForm.get('mobilePhone')?.patchValue('');
    this.otpSent = false;
    this.otpSessionId = null;
    this.maskedPhone = '';
    this.otpResendTimer = 0;
  }

  // Send OTP
  sendOtp(): void {
    if (this.otpForm.get('mobilePhone')?.invalid) {
      this.otpForm.get('mobilePhone')?.markAsTouched();
      this.error = 'Please enter a valid mobile number';
      return;
    }

    this.otpSendLoading = true;
    this.error = null;

    const phone = this.otpForm.get('mobilePhone')?.value;

    this.authService.sendOtp(phone)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.otpSendLoading = false;
          this.otpSessionId = response.sessionId || 'temp-session';
          this.otpSent = true;
          this.maskedPhone = this.maskPhoneNumber(phone);
          this.startOtpTimer();
        },
        error: (err: unknown) => {
          this.otpSendLoading = false;
          this.error = this.getErrorMessage(err);
        }
      });
  }

  // Resend OTP
  resendOtp(): void {
    this.otpResendLoading = true;
    this.error = null;

    const phone = this.otpForm.get('mobilePhone')?.value;

    this.authService.sendOtp(phone)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.otpResendLoading = false;
          this.otpSessionId = response.sessionId || 'temp-session';
          this.startOtpTimer();
        },
        error: (err: unknown) => {
          this.otpResendLoading = false;
          this.error = this.getErrorMessage(err);
        }
      });
  }

  // Start OTP timer for resend
  private startOtpTimer(): void {
    this.otpResendTimer = 30;
    interval(1000)
      .pipe(
        takeWhile(() => this.otpResendTimer > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.otpResendTimer--;
      });
  }

  // Handle OTP input
  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!/^[0-9]$/.test(value) && value !== '') {
      input.value = '';
      return;
    }

    this.otpForm.get(`otp${index}`)?.setValue(value);

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  // Check if OTP is complete
  isOtpComplete(): boolean {
    const otpFields = ['otp0', 'otp1', 'otp2', 'otp3', 'otp4', 'otp5'];
    return otpFields.every(field => this.otpForm.get(field)?.value);
  }

  // Handle mobile OTP signup
  onMobileOtpSignup(): void {
    if (!this.isOtpComplete() || !this.otpSessionId) {
      this.error = 'Please enter a valid OTP';
      return;
    }

    this.isLoading = true;
    this.error = null;

    const phone = this.otpForm.get('mobilePhone')?.value;
    const otp = ['otp0', 'otp1', 'otp2', 'otp3', 'otp4', 'otp5']
      .map(field => this.otpForm.get(field)?.value)
      .join('');

    this.authService.verifyOtpAndSignup(phone, otp, this.otpSessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          // Navigation handled by AuthService
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.error = this.getErrorMessage(err);
        }
      });
  }

  // Mask phone number for display
  private maskPhoneNumber(phone: string): string {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3');
  }

  // Helper to get user-friendly error messages
  private getErrorMessage(error: unknown): string {
    const err = error as { code?: string; message?: string; error?: { message?: string } };
    if (!err) return 'An unexpected error occurred. Please try again.';

    const message = err.message || (err.error && typeof err.error === 'object' && 'message' in err.error ? (err.error as any).message : null);
    const code = err.code;

    if (!code && message) return message;

    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or sign in.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use a stronger password.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign in was cancelled.';
      default:
        return message || 'An error occurred during sign up. Please try again.';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
