import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationDTO, SendNotificationRequest } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiBaseUrl}/api/notifications`;

  constructor(private http: HttpClient) {}

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
