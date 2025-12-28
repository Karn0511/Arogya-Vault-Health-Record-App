import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharePermissionService } from '../../../core/services/share-permission.service';
import { AuthService } from '../../../core/services/auth.service';
import { SharePermission, ShareScope, DEFAULT_SHARE_PRESETS, SharePreset } from '../../../models/share-permission.model';

@Component({
  selector: 'app-create-share',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Share Medical Records</h2>

        <!-- Quick Presets -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Quick Share Options</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (preset of sharePresets; track preset.id) {
              <button
                type="button"
                (click)="applyPreset(preset)"
                class="p-4 border-2 rounded-lg hover:border-primary-500 transition-colors text-left
                       border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white">{{ preset.name }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ preset.description }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Duration: {{ preset.defaultDuration }}h | Download: {{ preset.canDownload ? 'Yes' : 'No' }}
                    </p>
                  </div>
                </div>
              </button>
            }
          </div>
        </div>

        <!-- Custom Share Form -->
        <div class="border-t pt-6 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Custom Share Settings</h3>

          <form [formGroup]="shareForm" (ngSubmit)="onSubmit()">
            <!-- Share With -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share with Doctor
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  formControlName="sharedWithEmail"
                  placeholder="Doctor's email"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                <input
                  type="tel"
                  formControlName="sharedWithPhone"
                  placeholder="Doctor's phone (optional)"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
              </div>
              @if (shareForm.get('sharedWithEmail')?.invalid && shareForm.get('sharedWithEmail')?.touched) {
                <p class="text-red-500 text-sm mt-1">Please enter a valid email</p>
              }
            </div>

            <!-- What to Share -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What to share
              </label>
              <div class="space-y-2">
                @for (scope of availableScopes; track scope) {
                  <label class="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg
                                hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      [value]="scope"
                      (change)="toggleScope(scope, $event)"
                      class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
                    <span class="ml-3 text-gray-700 dark:text-gray-300">{{ formatScope(scope) }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Date Range -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range (optional)
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-600 dark:text-gray-400">From</label>
                  <input
                    type="date"
                    formControlName="dateRangeFrom"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                </div>
                <div>
                  <label class="text-xs text-gray-600 dark:text-gray-400">To</label>
                  <input
                    type="date"
                    formControlName="dateRangeTo"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                </div>
              </div>
            </div>

            <!-- Expiry -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Duration
              </label>
              <select
                formControlName="durationHours"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                <option [value]="24">24 hours</option>
                <option [value]="48">48 hours (2 days)</option>
                <option [value]="72">72 hours (3 days)</option>
                <option [value]="168">1 week</option>
                <option [value]="336">2 weeks</option>
                <option [value]="720">30 days</option>
                <option [value]="0">No expiry</option>
              </select>
            </div>

            <!-- Permissions -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="checkbox" formControlName="canView" [disabled]="true" [checked]="true"
                         class="w-4 h-4 text-primary-600 border-gray-300 rounded">
                  <span class="ml-3 text-gray-700 dark:text-gray-300">View records (always enabled)</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" formControlName="canDownload"
                         class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
                  <span class="ml-3 text-gray-700 dark:text-gray-300">Download records</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" formControlName="canPrint"
                         class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
                  <span class="ml-3 text-gray-700 dark:text-gray-300">Print records</span>
                </label>
              </div>
            </div>

            <!-- Purpose -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purpose (optional)
              </label>
              <textarea
                formControlName="purpose"
                rows="3"
                placeholder="Why are you sharing these records?"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"></textarea>
            </div>

            <!-- Actions -->
            <div class="flex gap-4">
              <button
                type="submit"
                [disabled]="shareForm.invalid || selectedScopes.length === 0 || isSubmitting"
                class="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700
                       disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
                @if (isSubmitting) {
                  <span>Creating share...</span>
                } @else {
                  <span>Create Share Link</span>
                }
              </button>
              <button
                type="button"
                (click)="router.navigate(['/patient/sharing'])"
                class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <!-- Success Message -->
        @if (createdShare) {
          <div class="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
              ✓ Share Created Successfully!
            </h3>

            <div class="space-y-4">
              <!-- Share Link -->
              <div>
                <label class="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  Share Link
                </label>
                <div class="flex gap-2">
                  <input
                    [value]="createdShare.shareLink"
                    readonly
                    class="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg">
                  <button
                    (click)="copyToClipboard(createdShare.shareLink!)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Copy
                  </button>
                </div>
              </div>

              <!-- Access Code -->
              @if (createdShare.accessCode) {
                <div>
                  <label class="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Access Code
                  </label>
                  <div class="text-3xl font-mono font-bold text-green-900 dark:text-green-100 tracking-wider">
                    {{ createdShare.accessCode }}
                  </div>
                </div>
              }

              <!-- QR Code -->
              @if (createdShare.qrCodeDataUrl) {
                <div>
                  <label class="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    QR Code
                  </label>
                  <img [src]="createdShare.qrCodeDataUrl" alt="QR Code" class="w-48 h-48 border border-green-300 dark:border-green-700 rounded-lg">
                </div>
              }

              <button
                (click)="router.navigate(['/patient/sharing'])"
                class="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium">
                View All Shares
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CreateShareComponent implements OnInit {
  shareForm: FormGroup;
  sharePresets = DEFAULT_SHARE_PRESETS;
  availableScopes: ShareScope[] = [
    'ALL_RECORDS',
    'PRESCRIPTIONS',
    'LAB_REPORTS',
    'IMAGING',
    'VACCINATIONS',
    'CONSULTATION_NOTES'
  ];
  selectedScopes: ShareScope[] = [];
  isSubmitting = false;
  createdShare: SharePermission | null = null;

  private fb = inject(FormBuilder);
  private shareService = inject(SharePermissionService);
  private authService = inject(AuthService);
  public router = inject(Router);

  constructor() {
    this.shareForm = this.fb.group({
      sharedWithEmail: ['', [Validators.required, Validators.email]],
      sharedWithPhone: [''],
      dateRangeFrom: [''],
      dateRangeTo: [''],
      durationHours: [24, Validators.required],
      canView: [true],
      canDownload: [false],
      canPrint: [false],
      purpose: ['']
    });
  }

  ngOnInit() {}

  applyPreset(preset: SharePreset) {
    this.selectedScopes = [...preset.scopes];
    this.shareForm.patchValue({
      durationHours: preset.defaultDuration,
      canDownload: preset.canDownload,
      canPrint: preset.canDownload
    });
  }

  toggleScope(scope: ShareScope, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedScopes.push(scope);
    } else {
      this.selectedScopes = this.selectedScopes.filter(s => s !== scope);
    }
  }

  formatScope(scope: ShareScope): string {
    return scope.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async onSubmit() {
    if (this.shareForm.invalid || this.selectedScopes.length === 0) return;

    this.isSubmitting = true;
    const formValue = this.shareForm.value;
    const currentUser = await this.authService.getCurrentUser();

    const expiresAt = formValue.durationHours > 0
      ? new Date(Date.now() + formValue.durationHours * 60 * 60 * 1000)
      : undefined;

    const shareData: Partial<SharePermission> = {
      patientId: currentUser!.id,
      patientName: currentUser!.fullName,
      sharedWithEmail: formValue.sharedWithEmail,
      sharedWithPhone: formValue.sharedWithPhone || undefined,
      scopes: this.selectedScopes,
      dateRangeFrom: formValue.dateRangeFrom ? new Date(formValue.dateRangeFrom) : undefined,
      dateRangeTo: formValue.dateRangeTo ? new Date(formValue.dateRangeTo) : undefined,
      expiresAt,
      canView: true,
      canDownload: formValue.canDownload,
      canPrint: formValue.canPrint,
      purpose: formValue.purpose || undefined,
      status: 'ACTIVE',
      currentAccessCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      this.createdShare = await this.shareService.createShare(shareData);
      this.shareForm.reset({ durationHours: 24, canView: true });
      this.selectedScopes = [];
    } catch (error) {
      alert('Failed to create share. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    });
  }
}
