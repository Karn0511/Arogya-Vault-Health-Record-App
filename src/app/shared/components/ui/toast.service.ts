import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
    duration?: number;
}

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

    private generateId(): string {
        return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    show(toast: Omit<Toast, 'id'>): void {
        const id = this.generateId();
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration || 5000,
        };

        const currentToasts = this.toastsSubject.value;
        this.toastsSubject.next([...currentToasts, newToast]);

        // Auto-dismiss after duration
        if (newToast.duration) {
            setTimeout(() => {
                this.dismiss(id);
            }, newToast.duration);
        }
    }

    success(title: string, description?: string): void {
        this.show({ title, description, variant: 'success' });
    }

    error(title: string, description?: string): void {
        this.show({ title, description, variant: 'destructive' });
    }

    info(title: string, description?: string): void {
        this.show({ title, description, variant: 'default' });
    }

    dismiss(id: string): void {
        const currentToasts = this.toastsSubject.value;
        this.toastsSubject.next(currentToasts.filter((t) => t.id !== id));
    }

    dismissAll(): void {
        this.toastsSubject.next([]);
    }
}
