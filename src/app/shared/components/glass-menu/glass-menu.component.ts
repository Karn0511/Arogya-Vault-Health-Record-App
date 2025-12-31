import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-glass-menu',
    templateUrl: './glass-menu.component.html',
    styleUrls: ['./glass-menu.component.scss'],
    animations: [
        trigger('overlay', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms ease-out', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0 }))
            ])
        ]),
        trigger('menu', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('500ms cubic-bezier(0.22, 1, 0.36, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('400ms cubic-bezier(0.22, 1, 0.36, 1)', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ]),
        trigger('item', [
            transition(':enter', [
                style({ transform: 'translateY(20px)', opacity: 0 }),
                animate('400ms {{delay}}ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
            ])
        ])
    ]
})
export class GlassMenuComponent {
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();

    menuItems = [
        { label: 'Dashboard', route: '/patient/dashboard' },
        { label: 'Appointments', route: '/patient/appointments' },
        { label: 'Medical Records', route: '/patient/medical-records' },
        { label: 'Prescriptions', route: '/patient/prescriptions' },
        { label: 'Profile', route: '/patient/profile' },
        { label: 'Settings', route: '/patient/settings' }
    ];

    socialLinks = [
        { label: 'Twitter', url: '#' },
        { label: 'LinkedIn', url: '#' },
        { label: 'Instagram', url: '#' }
    ];

    onClose() {
        this.close.emit();
    }
}
