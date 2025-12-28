export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW',
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  doctorName: string;
  specialization?: string;
  appointmentDateTime: Date;
  duration?: number; // in minutes
  location: string;
  isVirtual?: boolean;
  meetingLink?: string;
  notes?: string;
  status: AppointmentStatus;
  
  // Reminders
  reminderSent?: boolean;
  reminderDateTime?: Date;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateAppointmentDto {
  doctorId?: string;
  doctorName: string;
  specialization?: string;
  appointmentDateTime: Date;
  duration?: number;
  location: string;
  isVirtual?: boolean;
  meetingLink?: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  appointmentDateTime?: Date;
  duration?: number;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentFilter {
  status?: AppointmentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  doctorName?: string;
}
