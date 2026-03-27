import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { NotificationDTO } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>🔔 Notifications</h1>
      <p>Stay updated with your account activities</p>
    </div>

    <div *ngIf="notifications.length === 0" class="glass-card empty-state" style="animation: fadeInUp 0.5s ease-out;">
      <div class="empty-icon">🔕</div><p>No notifications yet</p>
    </div>

    <div class="notification-list">
      <div *ngFor="let n of notifications; let i = index" class="glass-card notification-item" [style.animation-delay]="(i * 0.05) + 's'">
        <div class="notification-icon">
          <span *ngIf="n.type === 'PAYMENT'">💰</span>
          <span *ngIf="n.type === 'ALERT'">⚠️</span>
          <span *ngIf="n.type === 'INFO'">ℹ️</span>
          <span *ngIf="n.type !== 'PAYMENT' && n.type !== 'ALERT' && n.type !== 'INFO'">📬</span>
        </div>
        <div class="notification-body">
          <h4>{{ n.title }}</h4>
          <p>{{ n.message }}</p>
          <span class="notification-time">{{ n.createdAt | date:'medium' }}</span>
        </div>
        <span class="badge badge-info" *ngIf="!n.read">New</span>
      </div>
    </div>
  `,
  styles: [`
    .notification-list { display: flex; flex-direction: column; gap: 12px; }
    .notification-item { display: flex; align-items: flex-start; gap: 16px; padding: 20px 24px; animation: fadeInUp 0.5s ease-out both; }
    .notification-icon { font-size: 1.5rem; padding-top: 2px; }
    .notification-body { flex: 1; }
    .notification-body h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; color: var(--text-primary); }
    .notification-body p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }
    .notification-time { font-size: 0.75rem; color: var(--text-muted); margin-top: 6px; display: block; }
  `]
})
export class NotificationsComponent implements OnInit {
  private notifService = inject(NotificationService);
  private auth = inject(AuthService);

  notifications: NotificationDTO[] = [];

  ngOnInit() {
    const userId = this.auth.getCurrentUserId() || 1;
    this.notifService.getUserNotifications(userId).subscribe({ next: (n) => this.notifications = n, error: () => {} });
  }
}
