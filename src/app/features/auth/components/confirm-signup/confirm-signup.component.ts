import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-signup',
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Confirm your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          We sent a verification code to {{ email }}
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="confirmForm" (ngSubmit)="onConfirm()">
            <div>
              <label for="code" class="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div class="mt-1">
                <input
                  id="code"
                  type="text"
                  formControlName="code"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter 6-digit code"
                />
              </div>
              <div
                *ngIf="
                  confirmForm.get('code')?.touched &&
                  confirmForm.get('code')?.hasError('required')
                "
                class="mt-1 text-sm text-red-600"
              >
                Code is required
              </div>
              <div
                *ngIf="
                  confirmForm.get('code')?.touched &&
                  confirmForm.get('code')?.hasError('pattern')
                "
                class="mt-1 text-sm text-red-600"
              >
                Code must be 6 digits
              </div>
            </div>

            <div *ngIf="error" class="mt-4 text-sm text-red-600">
              {{ error }}
            </div>

            <div class="mt-6">
              <button
                type="submit"
                [disabled]="confirmForm.invalid || isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ isLoading ? 'Verifying...' : 'Confirm Account' }}
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">
                  Didn't receive the code?
                </span>
              </div>
            </div>

            <div class="mt-6 text-center">
              <button
                type="button"
                (click)="onResendCode()"
                [disabled]="isResending"
                class="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {{ isResending ? 'Resending...' : 'Resend Code' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: [] // Using Tailwind classes in template
})
export class ConfirmSignupComponent implements OnInit, OnDestroy {
  confirmForm!: FormGroup;
  email: string = '';
  isLoading = false;
  isResending = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';

    if (!this.email) {
      this.router.navigate(['/auth/signup']);
      return;
    }

    this.confirmForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  onConfirm(): void {
    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;
    const code = this.confirmForm.get('code')?.value;

    this.authService
      .confirmSignUp(this.email, code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          // After confirmation, navigate to login
          this.router.navigate(['/auth/login'], {
            queryParams: { confirmed: 'true', email: this.email },
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.message || 'Verification failed. Please try again.';
        },
      });
  }

  onResendCode(): void {
    this.isResending = true;
    this.error = null;

    this.authService
      .resendConfirmationCode(this.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isResending = false;
          alert('Verification code resent to your email.');
        },
        error: (err) => {
          this.isResending = false;
          this.error = 'Failed to resend code: ' + (err.message || 'Unknown error');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
