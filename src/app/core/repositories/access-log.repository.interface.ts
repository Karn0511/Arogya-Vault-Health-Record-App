import { Observable } from 'rxjs';
import { AccessLog, CreateAccessLogDto, AccessLogFilter } from '@models/access-log.model';

export interface IAccessLogRepository {
  create(userId: string, dto: CreateAccessLogDto): Observable<AccessLog>;
  getByPatientId(patientId: string, filter?: AccessLogFilter): Observable<AccessLog[]>;
  getByUserId(userId: string, filter?: AccessLogFilter): Observable<AccessLog[]>;
  getRecent(patientId: string, limit?: number): Observable<AccessLog[]>;
}

