import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationDTO, SendNotificationRequest } from '../models/notification.model';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = `${this.configService.apiBaseUrl}/api/notifications`;
  }

  sendNotification(request: SendNotificationRequest): Observable<NotificationDTO> {
    return this.http.post<NotificationDTO>(`${this.apiUrl}/send`, request);
  }

  getUserNotifications(userId: number): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/${userId}`);
  }

  getAllNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(this.apiUrl);
  }
}
