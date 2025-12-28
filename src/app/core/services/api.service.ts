import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return this.authService.getAccessToken().pipe(
      switchMap((token: string | null) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        });
        return from([headers]);
      })
    );
  }

  get<T>(endpoint: string): Observable<T> {
    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) =>
        this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers })
      )
    );
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) =>
        this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers })
      )
    );
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) =>
        this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers })
      )
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) =>
        this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers })
      )
    );
  }
}
