import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharePermissionService } from '@core/services/share-permission.service';
import { AuthService } from '@core/services/auth.service';
import { AccessLogService } from '@core/services/access-log.service';
import { SharePermission, ShareStatus } from '@models/share-permission.model';
import { AccessLog } from '@models/access-log.model';

@Component({
  selector: 'app-active-shares',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">My Shares</h2>
        <button
          (click)="router.navigate(['/patient/sharing/create'])"
          class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium">
          + Create New Share
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          @for (tab of tabs; track tab.status) {
            <button
              (click)="selectedTab = tab.status; loadShares()"
              [class.border-primary-500]="selectedTab === tab.status"
              [class.text-primary-600]="selectedTab === tab.status"
              [class.dark:text-primary-400]="selectedTab === tab.status"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors
                     {{ selectedTab === tab.status ? '' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300' }}">
              {{ tab.label }}
              @if (tab.count !== undefined) {
                <span class="ml-2 px-2 py-1 text-xs rounded-full
                             {{ selectedTab === tab.status ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }}">
                  {{ tab.count }}
                </span>
              }
            </button>
          }
        </nav>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          }
        </div>
      }

      <!-- Shares List -->
      @if (!isLoading && shares.length > 0) {
        <div class="space-y-4">
          @for (share of shares; track share.id) {
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Header -->
                  <div class="flex items-center gap-3 mb-3">
                    <div class="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ share.sharedWithDoctorName || share.sharedWithEmail }}
                      </h3>
                      @if (share.sharedWithPhone) {
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ share.sharedWithPhone }}</p>
                      }
                    </div>
                    <span [class]="getStatusBadgeClass(share.status)" class="ml-auto px-3 py-1 rounded-full text-xs font-medium">
                      {{ share.status }}
                    </span>
                  </div>

                  <!-- Details Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Shared Records</label>
                      <div class="mt-1 flex flex-wrap gap-1">
                        @for (scope of share.scopes; track scope) {
                          <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                            {{ formatScope(scope) }}
                          </span>
                        }
                      </div>
                    </div>

                    <div>
                      <label class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</label>
                      <p class="text-sm text-gray-900 dark:text-white mt-1">
                        {{ share.createdAt | date:'medium' }}
                      </p>
                    </div>

                    <div>
                      <label class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expires</label>
                      <p class="text-sm text-gray-900 dark:text-white mt-1">
                        {{ share.expiresAt ? (share.expiresAt | date:'medium') : 'Never' }}
                      </p>
                    </div>
                  </div>

                  <!-- Access Stats -->
                  <div class="flex items-center gap-6 text-sm">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span class="text-gray-600 dark:text-gray-400">
                        Accessed {{ share.currentAccessCount }} time{{ share.currentAccessCount !== 1 ? 's' : '' }}
                      </span>
                    </div>

                    @if (share.lastAccessedAt) {
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-gray-600 dark:text-gray-400">
                          Last accessed {{ share.lastAccessedAt | date:'short' }}
                        </span>
                      </div>
                    }
                  </div>

                  <!-- Purpose -->
                  @if (share.purpose) {
                    <div class="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <label class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Purpose</label>
                      <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">{{ share.purpose }}</p>
                    </div>
                  }
                </div>

                <!-- Actions -->
                <div class="ml-6 flex flex-col gap-2">
                  @if (share.status === 'ACTIVE') {
                    <button
                      (click)="viewAccessLog(share)"
                      class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                             hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      View Log
                    </button>
                    <button
                      (click)="copyShareLink(share)"
                      class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Copy Link
                    </button>
                    <button
                      (click)="showQRCode(share)"
                      class="px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg
                             hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      Show QR
                    </button>
                    <button
                      (click)="revokeShare(share)"
                      class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Revoke
                    </button>
                  }
                  @if (share.status === 'REVOKED') {
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      Revoked on<br>{{ share.revokedAt | date:'short' }}
                    </div>
                  }
                </div>
              </div>

              <!-- Expandable Access Log -->
              @if (expandedShareId === share.id && accessLogs) {
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Access History</h4>
                  <div class="space-y-2 max-h-60 overflow-y-auto">
                    @for (log of accessLogs; track log.id) {
                      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                        <div class="flex items-center gap-3">
                          <div class="w-2 h-2 rounded-full" [class.bg-green-500]="log.success" [class.bg-red-500]="!log.success"></div>
                          <div>
                            <p class="font-medium text-gray-900 dark:text-white">{{ log.action }}</p>
                            @if (log.recordType) {
                              <p class="text-xs text-gray-600 dark:text-gray-400">{{ log.recordType }}</p>
                            }
                          </div>
                        </div>
                        <div class="text-right text-gray-600 dark:text-gray-400">
                          <p>{{ log.timestamp | date:'short' }}</p>
                          @if (log.ipAddress) {
                            <p class="text-xs">{{ log.ipAddress }}</p>
                          }
                        </div>
                      </div>
                    }
                    @if (accessLogs.length === 0) {
                      <p class="text-center text-gray-500 dark:text-gray-400 py-4">No access yet</p>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading && shares.length === 0) {
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No {{ selectedTab.toLowerCase() }} shares</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ selectedTab === 'ACTIVE' ? 'Create your first share to securely grant access to your medical records.' : 'No shares in this category.' }}
          </p>
          @if (selectedTab === 'ACTIVE') {
            <button
              (click)="router.navigate(['/patient/sharing/create'])"
              class="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium">
              Create Your First Share
            </button>
          }
        </div>
      }

      <!-- QR Code Modal -->
      @if (showingQR && selectedShare) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="showingQR = false">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Share QR Code</h3>
            @if (selectedShare.qrCodeDataUrl) {
              <img [src]="selectedShare.qrCodeDataUrl" alt="QR Code" class="w-full mb-4 border border-gray-300 dark:border-gray-700 rounded-lg">
            }
            @if (selectedShare.accessCode) {
              <div class="text-center mb-4">
                <label class="text-sm text-gray-600 dark:text-gray-400">Access Code</label>
                <p class="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                  {{ selectedShare.accessCode }}
                </p>
              </div>
            }
            <button
              (click)="showingQR = false"
              class="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium">
              Close
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ActiveSharesComponent implements OnInit {
  shares: SharePermission[] = [];
  accessLogs: AccessLog[] | null = null;
  expandedShareId: string | null = null;
  selectedShare: SharePermission | null = null;
  showingQR = false;
  isLoading = true;
  selectedTab: ShareStatus = 'ACTIVE';

  tabs = [
    { status: 'ACTIVE' as ShareStatus, label: 'Active', count: 0 },
    { status: 'EXPIRED' as ShareStatus, label: 'Expired', count: 0 },
    { status: 'REVOKED' as ShareStatus, label: 'Revoked', count: 0 }
  ];

  private shareService = inject(SharePermissionService);
  private accessLogService = inject(AccessLogService);
  private authService = inject(AuthService);
  public router = inject(Router);

  constructor() {}

  async ngOnInit() {
    await this.loadShares();
    await this.loadCounts();
  }

  async loadShares() {
    this.isLoading = true;
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (currentUser) {
        this.shares = await this.shareService.getSharesByPatient(currentUser.id, this.selectedTab);
      }
    } catch (error) {
      // Error loading shares
    } finally {
      this.isLoading = false;
    }
  }

  async loadCounts() {
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (currentUser) {
        for (const tab of this.tabs) {
          const shares = await this.shareService.getSharesByPatient(currentUser.id, tab.status);
          tab.count = shares.length;
        }
      }
    } catch (error) {
      // Error loading counts
    }
  }

  async viewAccessLog(share: SharePermission) {
    if (this.expandedShareId === share.id) {
      this.expandedShareId = null;
      this.accessLogs = null;
    } else {
      this.expandedShareId = share.id;
      this.accessLogs = await this.accessLogService.getLogsByShare(share.id);
    }
  }

  async revokeShare(share: SharePermission) {
    if (!confirm(`Are you sure you want to revoke access for ${share.sharedWithDoctorName || share.sharedWithEmail}?`)) {
      return;
    }

    try {
      await this.shareService.revokeShare(share.id, 'Revoked by patient');
      await this.loadShares();
      await this.loadCounts();
    } catch (error) {
      alert('Failed to revoke share. Please try again.');
    }
  }

  copyShareLink(share: SharePermission) {
    if (share.shareLink) {
      navigator.clipboard.writeText(share.shareLink).then(() => {
        alert('Share link copied to clipboard!');
      });
    }
  }

  showQRCode(share: SharePermission) {
    this.selectedShare = share;
    this.showingQR = true;
  }

  formatScope(scope: string): string {
    return scope.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStatusBadgeClass(status: ShareStatus): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'EXPIRED':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'REVOKED':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  }
}
