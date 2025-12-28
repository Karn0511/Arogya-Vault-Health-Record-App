export interface RecentRecord {
    id: string;
    name: string;
    type: 'lab-report' | 'prescription' | 'vaccination' | 'other';
    date: string;
}

export interface UpcomingAppointment {
    doctor: string;
    specialization: string;
    date: string;
}

export interface DashboardStats {
    totalRecords: number;
    activeMedications: number;
    upcomingAppointments: number;
}
