import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AutoDeletionOption, UserSettingsService, UserProfileResponse } from '@core/services/user-settings.service';

@Component({
  selector: 'app-patient-settings',
  templateUrl: './patient-settings.component.html',
  styleUrls: ['./patient-settings.component.scss'],
})
export class PatientSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(UserSettingsService);
  private router = inject(Router);

  loading = true;
  saving = false;
  deleting = false;

  message = signal('');
  error = signal('');

  profile: UserProfileResponse['user'] | null = null;
  options: AutoDeletionOption[] = [];

  autoDeletionForm = this.fb.group({
    days: [0, [Validators.required]],
  });

  deleteForm = this.fb.group({
    confirmText: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.message.set('');
    this.error.set('');

    this.settingsService.loadProfileWithOptions().subscribe({
      next: ({ profile, options }) => {
        this.profile = profile.user;
        this.options = options;
        const currentDays = this.profile?.autoDeletionDays ?? 0;
        this.autoDeletionForm.patchValue({ days: currentDays });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error.set(err.error?.error || err.message || 'Failed to load settings');
      },
    });
  }

  saveAutoDeletion(): void {
    if (this.autoDeletionForm.invalid) {
      this.autoDeletionForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.message.set('');
    this.error.set('');

    const days = Number(this.autoDeletionForm.get('days')?.value || 0);

    this.settingsService.updateAutoDeletion(days).subscribe({
      next: (res) => {
        this.saving = false;
        this.message.set(res.message || 'Preference saved');
        if (this.profile) {
          this.profile.autoDeletionDays = days;
        }
      },
      error: (err) => {
        this.saving = false;
        this.error.set(err.error?.error || err.message || 'Unable to save');
      },
    });
  }

  deleteAccount(): void {
    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      return;
    }

    const confirmText = this.deleteForm.get('confirmText')?.value || '';
    if (confirmText !== 'DELETE MY ACCOUNT') {
      this.error.set('Type "DELETE MY ACCOUNT" to confirm.');
      return;
    }

    this.deleting = true;
    this.error.set('');
    this.message.set('');

    this.settingsService.deleteAccount(confirmText).subscribe({
      next: (res) => {
        this.deleting = false;
        this.message.set(res.message || 'Account deleted');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.deleting = false;
        this.error.set(err.error?.error || err.message || 'Failed to delete account');
      },
    });
  }

  formatDate(date?: string): string {
    if (!date) return 'Not recorded';
    return new Date(date).toLocaleString();
  }
}
