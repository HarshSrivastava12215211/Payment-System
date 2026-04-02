import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { WalletService } from '../../services/wallet.service';
import { NotificationService } from '../../services/notification.service';
import { RewardsService } from '../../services/rewards.service';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserDto } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container fade-in">
      <!-- DASHBOARD GRID -->
      <div class="dashboard-grid">
        <!-- LEFT COLUMN: WALLET & REWARDS -->
        <div class="flex-column gap-3">
          <!-- PREMIUM WALLET CARD -->
          <div class="card-3d grad-blue premium-shadow p-4 text-white" style="position: relative; overflow: hidden;">
            <div class="card-bg-decoration"></div>
            <div class="flex-between mb-3" style="position: relative; z-index: 2;">
              <span class="font-bold" style="font-size: 0.85rem; opacity: 0.9; letter-spacing: 1px;">TOTAL BALANCE</span>
              <span style="font-size: 1.5rem;">💳</span>
            </div>
            <div class="balance-amount mb-2" style="position: relative; z-index: 2;">
              <h2 class="font-black" style="font-size: 2.8rem; letter-spacing: -1px;">₹{{ walletBalance | number:'1.2-2' }}</h2>
            </div>
            <div class="flex-between mt-3" style="position: relative; z-index: 2; opacity: 0.9; font-size: 0.82rem;">
              <span>User ID: {{ userId }}</span>
              <span class="badge" [class.badge-success]="userProfile?.isKycApproved" style="background: rgba(255,255,255,0.2); color: white; border: none;">
                {{ userProfile?.isKycApproved ? '✓ KYC Verified' : '⚠ KYC Pending' }}
              </span>
            </div>
            <button class="btn btn-sm mt-3 w-full font-bold" style="background: white; color: var(--primary-dark);" routerLink="/wallet">
              Wallet Details
            </button>
          </div>

          <!-- INTEGRATED REWARDS CARD -->
          <div class="glass-card p-3" style="border-left: 4px solid var(--warning);">
            <div class="flex-between mb-2">
              <h3 class="font-bold text-primary" style="font-size: 1.1rem;">💎 Rewards</h3>
              <span class="badge badge-warning">Tier: {{ rewardPointsData?.tier || 'BRONZE' }}</span>
            </div>
            <div class="flex-column gap-1">
              <span class="font-black" style="font-size: 2rem; color: #d97706;">{{ rewardPoints }} <small style="font-size: 0.9rem; font-weight: 600;">pts</small></span>
              <div class="limit-bar">
                <div class="limit-fill" [style.width.%]="(rewardPoints % 500) / 5"></div>
              </div>
              <p class="text-muted" style="font-size: 0.75rem;">{{ 500 - (rewardPoints % 500) }} points until next tier!</p>
            </div>
            
            <div class="featured-reward mt-3 mb-2" *ngIf="featuredReward" style="background: rgba(245, 158, 11, 0.05); padding: 12px; border-radius: var(--radius-md); border: 1px dashed var(--warning);">
               <p class="font-bold" style="font-size: 0.65rem; color: #d97706; text-transform: uppercase;">Featured Reward</p>
               <div class="flex-between">
                 <span class="font-bold" style="font-size: 0.85rem;">{{ featuredReward.name }}</span>
                 <span class="badge badge-warning" style="font-size: 0.65rem;">{{ featuredReward.pointsCost }} pts</span>
               </div>
               <button class="btn btn-warning btn-sm mt-2 w-full" (click)="quickRedeem(featuredReward)" [disabled]="rewardPoints < featuredReward.pointsCost">
                 Quick Redeem
               </button>
            </div>

            <button class="btn btn-secondary btn-sm mt-1 w-full" style="font-size: 0.75rem;" routerLink="/rewards">
              Loyalty Benefits →
            </button>
          </div>

          <!-- QUICK ACTIONS -->
          <div class="glass-card p-3">
            <h4 class="font-bold text-muted mb-3" style="font-size: 0.9rem; text-transform: uppercase;">Direct Actions</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <button class="btn btn-secondary btn-sm flex-column p-3" routerLink="/send-money">
                <span style="font-size: 1.5rem;">💸</span>
                <span>Send Money</span>
              </button>
              <button class="btn btn-secondary btn-sm flex-column p-3" routerLink="/kyc">
                <span style="font-size: 1.5rem;">🆔</span>
                <span>Verify KYC</span>
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: ACTIVITY & STATS -->
        <div class="flex-column gap-3">
          <!-- MINI STATS ROW -->
          <div class="flex gap-2">
            <div class="glass-card flex-1 p-2 text-center">
              <div class="stat-icon blue" style="margin: 0 auto 8px;">📊</div>
              <div class="font-bold" style="font-size: 1.2rem;">{{ totalTransactions }}</div>
              <div class="text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Operations</div>
            </div>
            <div class="glass-card flex-1 p-2 text-center">
              <div class="stat-icon cyan" style="margin: 0 auto 8px;">🔔</div>
              <div class="font-bold" style="font-size: 1.2rem;">{{ notificationCount }}</div>
              <div class="text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Notices</div>
            </div>
          </div>

          <!-- RECENT TRANSACTIONS TABLE -->
          <div class="glass-card p-3" style="flex: 1; min-height: 400px;">
            <div class="flex-between mb-3">
              <h3 class="font-bold text-primary">Activity Log</h3>
              <a routerLink="/transactions" class="btn-text" style="font-size: 0.82rem; color: var(--primary); font-weight: 600; text-decoration: none;">Full History →</a>
            </div>

            <div class="table-container" style="box-shadow: none; border: 1px solid var(--border); background: transparent;">
              <table>
                <thead>
                  <tr>
                    <th>Stream</th>
                    <th>ID</th>
                    <th>Volume</th>
                    <th>State</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let tx of recentTransactions" class="fade-in">
                    <td>
                      <div class="flex align-center gap-1">
                        <span class="tx-icon-circle" [class.debit]="tx.senderId == userId" [class.credit]="tx.receiverId == userId">
                          {{ tx.senderId == userId ? '⬆' : '⬇' }}
                        </span>
                        <span class="font-bold">{{ tx.senderId == userId ? 'Debit' : 'Credit' }}</span>
                      </div>
                    </td>
                    <td class="text-muted" style="font-size: 0.8rem; font-family: monospace;">#{{ tx.transactionId || tx.id | slice:0:8 }}</td>
                    <td class="font-bold" [style.color]="tx.senderId == userId ? 'var(--danger)' : 'var(--success)'">
                      {{ tx.senderId == userId ? '-' : '+' }}₹{{ tx.amount | number:'1.2-2' }}
                    </td>
                    <td>
                      <span class="badge" [class.badge-success]="tx.status === 'SUCCESS' || tx.status === 'COMPLETED'" [class.badge-warning]="tx.status === 'PENDING'" [class.badge-danger]="tx.status === 'FAILED'">
                        {{ tx.status }}
                      </span>
                    </td>
                    <td class="text-muted" style="font-size: 0.72rem;">{{ (tx.createdAt || tx.timestamp) | date:'shortTime' }}</td>
                  </tr>
                  <tr *ngIf="recentTransactions.length === 0">
                    <td colspan="5" class="empty-state">
                      <div class="empty-icon">🍃</div>
                      System log is currenty empty.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid { display: grid; grid-template-columns: 350px 1fr; gap: 24px; }
    .card-bg-decoration { position: absolute; top: -30%; right: -20%; width: 250px; height: 250px; background: radial-gradient(circle, rgba(255,255,255,0.2), transparent); z-index: 1; border-radius: 50%; }
    .tx-icon-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: white; }
    .tx-icon-circle.debit { background: var(--danger); }
    .tx-icon-circle.credit { background: var(--success); }
    @media (max-width: 992px) { .dashboard-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private walletService = inject(WalletService);
  private notificationService = inject(NotificationService);
  private rewardsService = inject(RewardsService);
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  walletBalance = 0;
  totalTransactions = 0;
  rewardPoints = 0;
  rewardPointsData: any = null;
  featuredReward: any = null;
  notificationCount = 0;
  recentTransactions: any[] = [];
  userId = 0;
  userProfile: UserDto | null = null;
  loadError = false; // We'll keep this for critical failures, but use it sparingly
  today = new Date();
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private walletSubscription: Subscription | null = null;
  private onFocus = () => this.loadLiveData();
  private onVisibility = () => {
    if (document.visibilityState === 'visible') this.loadLiveData();
  };

  ngOnInit() {
    // 1. Prioritize stored user profile from AuthService (set during login)
    this.userProfile = this.authService.getCurrentUser();
    if (this.userProfile) {
      this.userId = this.userProfile.id;
      console.log('DashboardComponent: Using stored profile for user', this.userId);
    } else {
      // Fallback: try to get ID from AuthService if it has logic for it, or use default (less ideal)
      this.userId = this.authService.getCurrentUserId() || 1;
      console.log('DashboardComponent: Fetching profile for user', this.userId);
    }
    const cachedWallet = this.walletService.getCachedWallet(this.userId);
    if (cachedWallet) {
      this.walletBalance = cachedWallet.balance || 0;
    }
    this.walletSubscription = this.walletService.wallet$.subscribe((wallet) => {
      if (wallet?.userId === this.userId) {
        this.walletBalance = wallet.balance || 0;
      }
    });
    this.loadDashboard();
    this.refreshTimer = setInterval(() => this.loadLiveData(), 3000);
    window.addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  loadDashboard() {
    if (!this.userId) return;
    
    // Refresh User Profile from server to ensure latest KYC/Role info
    this.userService.getUserById(this.userId).subscribe({
      next: (u) => { 
        this.userProfile = u; 
        this.authService.setCurrentUser(u); 
      },
      error: (err) => { 
        console.error('Dashboard: User profile refresh err', err);
        // If we have no profile at all, this is a critical error
        if (!this.userProfile) this.loadError = true;
      }
    });

    this.loadLiveData();

    // Fetch Rewards & Catalog
    this.rewardsService.getUserPoints(this.userId).subscribe({
      next: (r) => { this.rewardPointsData = r; this.rewardPoints = r.totalPoints || 0; },
      error: (err) => { console.error('Dashboard: Rewards err', err); }
    });

    this.rewardsService.getActiveCatalog().subscribe({
      next: (c) => { if (c && c.length > 0) this.featuredReward = c[0]; },
      error: (err) => { console.error('Dashboard: Catalog err', err); }
    });

    // Fetch Notifications
    this.notificationService.getUserNotifications(this.userId).subscribe({
      next: (n) => { this.notificationCount = n.filter((note: any) => note.status === 'PENDING').length || n.length; },
      error: (err) => { console.error('Dashboard: Note err', err); }
    });
  }

  loadLiveData() {
    if (!this.userId) return;

    this.walletService.getWallet(this.userId).subscribe({
      next: (w) => { this.walletBalance = w.balance || 0; },
      error: (err) => { console.error('Dashboard: Wallet err', err); }
    });

    this.transactionService.getUserTimeline(this.userId).subscribe({
      next: (txs) => {
        this.totalTransactions = txs.length;
        this.recentTransactions = txs.slice(0, 6);
      },
      error: (err) => { console.error('Dashboard: TX err', err); }
    });
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
      this.walletSubscription = null;
    }
    window.removeEventListener('focus', this.onFocus);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  quickRedeem(item: any) {
    if (this.rewardPoints < item.pointsCost) return;
    this.rewardsService.redeem({ userId: this.userId, catalogItemId: item.id }).subscribe({
      next: () => { alert('Success! Reward redeemed.'); this.loadDashboard(); },
      error: () => alert('Redemption failed. Check your points.')
    });
  }
}
