import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { ToastService } from '../../../../shared/components/ui/toast.service';

@Component({
    selector: 'app-ui-showcase',
    standalone: true,
    imports: [CommonModule, SharedModule],
    templateUrl: './ui-showcase.component.html',
    styleUrls: ['./ui-showcase.component.scss'],
})
export class UiShowcaseComponent {
    dialogOpen = false;
    activeTab = 'account';

    constructor(private toastService: ToastService) { }

    showSuccessToast(): void {
        this.toastService.success('Success!', 'Your changes have been saved successfully.');
    }

    showErrorToast(): void {
        this.toastService.error('Error!', 'Something went wrong. Please try again.');
    }

    showInfoToast(): void {
        this.toastService.info('Info', 'This is an informational message.');
    }

    openDialog(): void {
        this.dialogOpen = true;
    }

    closeDialog(): void {
        this.dialogOpen = false;
    }
}
