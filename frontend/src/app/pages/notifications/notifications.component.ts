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
    <div class="fade-in" style="max-width: 800px; margin: 0 auto;">
      <div class="glass-card p-3 mb-3 flex-between align-center">
        <div>
          <h2 class="font-black text-primary mb-1">🔔 Communication Hub</h2>
          <p class="text-muted" style="font-size: 0.82rem;">Real-time system alerts and transaction signals.</p>
        </div>
        <button class="btn btn-secondary btn-sm" *ngIf="notifications.length > 0">Mark All Seen</button>
      </div>

      <div *ngIf="notifications.length === 0" class="glass-card p-5 text-center fade-in">
        <div class="stat-icon blue mx-auto mb-3" style="width: 80px; height: 80px; font-size: 2.5rem; margin: 0 auto;">🔕</div>
        <h3 class="font-bold text-muted">Clear Skies</h3>
        <p class="text-muted">You have no pending notifications at this time.</p>
      </div>

      <div class="flex-column gap-2">
        <div *ngFor="let n of notifications; let i = index" 
             class="glass-card p-3 flex align-center gap-3 fade-in-up" 
             [style.animation-delay]="(i * 0.05) + 's'"
             [style.border-left]="!n.read ? '4px solid var(--primary)' : '1px solid var(--border)'">
          <div class="stat-icon sm" [class.blue]="n.type === 'INFO'" [class.emerald]="n.type === 'PAYMENT'" [class.amber]="n.type === 'ALERT'">
            <span *ngIf="n.type === 'PAYMENT'">💰</span>
            <span *ngIf="n.type === 'ALERT'">⚠️</span>
            <span *ngIf="n.type === 'INFO'">ℹ️</span>
            <span *ngIf="n.type !== 'PAYMENT' && n.type !== 'ALERT' && n.type !== 'INFO'">📬</span>
          </div>
          <div class="flex-1">
            <div class="flex-between">
              <h4 class="font-bold" [class.text-primary]="!n.read">{{ n.title }}</h4>
              <span class="text-muted" style="font-size: 0.72rem;">{{ n.createdAt | date:'shortTime' }}</span>
            </div>
            <p class="text-secondary mt-1" style="font-size: 0.85rem;">{{ n.message }}</p>
          </div>
          <div *ngIf="!n.read" class="badge badge-info badge-sm">NEW</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-icon.sm { width: 40px; height: 40px; font-size: 1.1rem; flex-shrink: 0; }
    .amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .mx-auto { margin-left: auto; margin-right: auto; }
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
