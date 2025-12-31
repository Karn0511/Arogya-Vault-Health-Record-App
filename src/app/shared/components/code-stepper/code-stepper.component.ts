import { Component, Input } from '@angular/core';

export interface Step {
    title: string;
    description: string;
    code?: string;
    language?: string;
}

@Component({
    selector: 'app-code-stepper',
    templateUrl: './code-stepper.component.html',
    styleUrls: ['./code-stepper.component.scss']
})
export class CodeStepperComponent {
    @Input() steps: Step[] = [];

    copiedIndex: number | null = null;

    copyToClipboard(code: string, index: number) {
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            this.copiedIndex = index;
            setTimeout(() => this.copiedIndex = null, 2000);
        });
    }
}
