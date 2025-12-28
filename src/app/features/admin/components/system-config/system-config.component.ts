import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ConfigSection {
  title: string;
  icon: string;
  settings: ConfigItem[];
}

interface ConfigItem {
  key: string;
  label: string;
  value: string | boolean;
  type: 'text' | 'toggle' | 'select';
  options?: string[];
  description?: string;
}

@Component({
    selector: 'app-system-config',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
      <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <!-- Header -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="flex items-center justify-between mb-2">
            <h1 class="text-4xl font-bold text-white flex items-center gap-3">
              <span class="text-5xl">⚙️</span>
              System Configuration
            </h1>
            <button
              (click)="saveSettings()"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-lg">
              💾 Save Changes
            </button>
          </div>
          <p class="text-slate-400">Manage system-wide settings and configurations</p>
        </div>

        <!-- Config Sections -->
        <div class="max-w-7xl mx-auto space-y-6">
          <div *ngFor="let section of configSections" class="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
            <!-- Section Header -->
            <div class="bg-gradient-to-r from-slate-700/50 to-slate-800/50 px-6 py-4 border-b border-slate-700/50">
              <h2 class="text-xl font-bold text-white flex items-center gap-3">
                <span class="text-2xl">{{ section.icon }}</span>
                {{ section.title }}
              </h2>
            </div>

            <!-- Settings List -->
            <div class="p-6 space-y-4">
              <div *ngFor="let setting of section.settings" class="flex items-center justify-between py-4 border-b border-slate-700/30 last:border-0">
                <div class="flex-1">
                  <label class="text-white font-medium">{{ setting.label }}</label>
                  <p *ngIf="setting.description" class="text-sm text-slate-400 mt-1">{{ setting.description }}</p>
                </div>

                <!-- Toggle -->
                <div *ngIf="setting.type === 'toggle'" class="ml-4">
                  <button
                    (click)="toggleSetting(setting)"
                    [class.bg-blue-600]="setting.value"
                    [class.bg-slate-600]="!setting.value"
                    class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors">
                    <span
                      [class.translate-x-7]="setting.value"
                      [class.translate-x-1]="!setting.value"
                      class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"></span>
                  </button>
                </div>

                <!-- Text Input -->
                <div *ngIf="setting.type === 'text'" class="ml-4 w-64">
                  <input
                    [(ngModel)]="setting.value"
                    type="text"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>

                <!-- Select -->
                <div *ngIf="setting.type === 'select'" class="ml-4 w-64">
                  <select
                    [(ngModel)]="setting.value"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option *ngFor="let option of setting.options" [value]="option">{{ option }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div class="bg-gradient-to-br from-green-600/20 to-emerald-600/10 border border-green-500/30 rounded-xl p-6">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span class="text-2xl">ℹ️</span>
              System Information
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p class="text-green-300 text-sm">Version</p>
                <p class="text-white font-bold">v2.0.0</p>
              </div>
              <div>
                <p class="text-green-300 text-sm">Environment</p>
                <p class="text-white font-bold">Production</p>
              </div>
              <div>
                <p class="text-green-300 text-sm">Database</p>
                <p class="text-white font-bold">MongoDB</p>
              </div>
              <div>
                <p class="text-green-300 text-sm">Uptime</p>
                <p class="text-white font-bold">24 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    styles: [`
      :host {
        display: block;
      }
    `]
})
export class SystemConfigComponent {
  configSections: ConfigSection[] = [
    {
      title: 'General Settings',
      icon: '🌐',
      settings: [
        { key: 'siteName', label: 'Site Name', value: 'Arogya Vault', type: 'text', description: 'The name of your healthcare platform' },
        { key: 'maintenanceMode', label: 'Maintenance Mode', value: false, type: 'toggle', description: 'Enable to put the site in maintenance mode' },
        { key: 'registrationEnabled', label: 'User Registration', value: true, type: 'toggle', description: 'Allow new users to register' },
      ]
    },
    {
      title: 'Security Settings',
      icon: '🔒',
      settings: [
        { key: 'twoFactorAuth', label: 'Two-Factor Authentication', value: false, type: 'toggle', description: 'Require 2FA for all users' },
        { key: 'sessionTimeout', label: 'Session Timeout', value: '30 minutes', type: 'select', options: ['15 minutes', '30 minutes', '1 hour', '2 hours'], description: 'Automatic logout after inactivity' },
        { key: 'passwordExpiry', label: 'Password Expiry', value: '90 days', type: 'select', options: ['Never', '30 days', '60 days', '90 days'], description: 'Force password change after this period' },
      ]
    },
    {
      title: 'Notification Settings',
      icon: '🔔',
      settings: [
        { key: 'emailNotifications', label: 'Email Notifications', value: true, type: 'toggle', description: 'Send email notifications to users' },
        { key: 'smsNotifications', label: 'SMS Notifications', value: false, type: 'toggle', description: 'Send SMS notifications to users' },
        { key: 'pushNotifications', label: 'Push Notifications', value: true, type: 'toggle', description: 'Send browser push notifications' },
      ]
    },
    {
      title: 'Data Management',
      icon: '💾',
      settings: [
        { key: 'autoBackup', label: 'Automatic Backups', value: true, type: 'toggle', description: 'Enable automatic database backups' },
        { key: 'backupFrequency', label: 'Backup Frequency', value: 'Daily', type: 'select', options: ['Hourly', 'Daily', 'Weekly'], description: 'How often to backup the database' },
        { key: 'dataRetention', label: 'Data Retention Period', value: '1 year', type: 'select', options: ['3 months', '6 months', '1 year', '2 years', 'Indefinite'], description: 'How long to keep old records' },
      ]
    }
  ];

  toggleSetting(setting: ConfigItem): void {
    setting.value = !setting.value;
  }

  saveSettings(): void {
    console.log('Saving settings...', this.configSections);
    // Here you would typically call a service to save to backend
    alert('Settings saved successfully!');
  }
}
