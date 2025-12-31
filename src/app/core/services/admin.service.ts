import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface AuditLog {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
    } | null;
    action: string;
    resource: string;
    details: any;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    status: 'SUCCESS' | 'FAILURE';
}

export interface PaginatedResponse<T> {
    logs?: T[]; // For audit logs
    users?: T[]; // For users
    doctors?: T[]; // For doctors
    total: number;
    page: number;
    pages: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    // Dashboard Stats
    getStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/stats`);
    }

    // Audit Logs
    getAuditLogs(page: number = 1, limit: number = 20): Observable<PaginatedResponse<AuditLog>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<PaginatedResponse<AuditLog>>(`${this.apiUrl}/audit-logs`, { params });
    }

    // User Management
    getUsers(page: number = 1, limit: number = 10): Observable<PaginatedResponse<any>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<PaginatedResponse<any>>(`${this.apiUrl}/users`, { params });
    }

    updateUserStatus(userId: string, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${userId}/status`, { status });
    }

    // Doctor Management
    getDoctors(page: number = 1, limit: number = 10): Observable<PaginatedResponse<any>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<PaginatedResponse<any>>(`${this.apiUrl}/doctors`, { params });
    }

    verifyDoctor(doctorId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/doctors/${doctorId}/verify`, {});
    }
}
