import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
    <div class="dashboard-container" style="animation: fadeIn 0.8s ease-out">
      <!-- HEADER SECTION -->
      <div class="page-header flex-between mb-3">
        <div class="greeting">
          <h1 style="font-size: 2.2rem; font-weight: 900; background: linear-gradient(135deg, var(--text-primary), var(--primary-dark)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Hello, {{ userProfile?.name || 'User' }}! 👋
          </h1>
          <p style="color: var(--text-secondary); font-weight: 500;">
            {{ today | date:'fullDate' }} • Welcome to your premium wallet
          </p>
        </div>
        <div class="flex gap-2 align-center">
           <div *ngIf="loadError" class="badge badge-danger">⚠️ Sync Error</div>
           <button class="btn btn-secondary btn-icon float-animation" (click)="loadDashboard()" title="Refresh Data">🔄</button>
           <div class="user-avatar-mini" *ngIf="userProfile">
             <div class="avatar-circle grad-blue">{{ userProfile.name.charAt(0) }}</div>
             <div class="avatar-info">
               <span class="name">{{ userProfile.name }}</span>
               <span class="role badge badge-info" style="font-size: 0.6rem; padding: 2px 6px;">{{ userProfile.role }}</span>
             </div>
           </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- LEFT COLUMN: WALLET & REWARDS -->
        <div class="dashboard-sidebar-col flex-column gap-3">
          <!-- PREMIUM WALLET CARD -->
          <div class="card-3d grad-blue premium-wallet-card" style="padding: 28px; position: relative; overflow: hidden; color: white;">
            <div class="card-bg-decoration"></div>
            <div class="flex-between mb-3" style="position: relative; z-index: 2;">
              <span style="font-size: 0.85rem; font-weight: 600; opacity: 0.9; letter-spacing: 1px;">TOTAL BALANCE</span>
              <span style="font-size: 1.5rem;">💳</span>
            </div>
            <div class="balance-amount mb-2" style="position: relative; z-index: 2;">
              <h2 style="font-size: 2.8rem; font-weight: 800; letter-spacing: -1px;">₹{{ walletBalance | number:'1.2-2' }}</h2>
            </div>
            <div class="flex-between mt-3" style="position: relative; z-index: 2; opacity: 0.9; font-size: 0.82rem;">
              <span>User ID: {{ userId }}</span>
              <span class="badge" [class.badge-success]="userProfile?.isKycApproved" style="background: rgba(255,255,255,0.2); color: white; border: none;">
                {{ userProfile?.isKycApproved ? '✓ KYC Verified' : '⚠ KYC Pending' }}
              </span>
            </div>
            <button class="btn btn-sm mt-3" style="background: white; color: var(--primary-dark); width: 100%; font-weight: 700;" routerLink="/wallet">
              Go to Wallet Page
            </button>
          </div>

          <!-- INTEGRATED REWARDS CARD -->
          <div class="glass-card reward-card-integrated" style="padding: 24px; border-left: 4px solid var(--warning);">
            <div class="flex-between mb-2">
              <h3 style="font-weight: 800; color: var(--text-primary); font-size: 1.1rem;">💎 Rewards</h3>
              <span class="badge badge-warning">Tier: {{ rewardPointsData?.tier || 'BRONZE' }}</span>
            </div>
            <div class="points-display flex-column gap-1">
              <span style="font-size: 2rem; font-weight: 800; color: #d97706;">{{ rewardPoints }} <small style="font-size: 0.9rem; font-weight: 600;">pts</small></span>
              <div class="progress-bar" style="height: 6px; background: #fee2e2; border-radius: 3px; overflow: hidden; margin: 8px 0;">
                <div class="progress-fill" [style.width.%]="(rewardPoints % 500) / 5" style="height: 100%; background: var(--warning); border-radius: 3px; transition: width 1s ease-out;"></div>
              </div>
              <p style="font-size: 0.75rem; color: var(--text-muted);">{{ 500 - (rewardPoints % 500) }} points until next tier!</p>
            </div>
            
            <div class="featured-reward mt-3 mb-2" *ngIf="featuredReward" style="background: rgba(245, 158, 11, 0.05); padding: 12px; border-radius: var(--radius-md); border: 1px dashed var(--warning);">
               <p style="font-size: 0.65rem; font-weight: 700; color: #d97706; text-transform: uppercase;">Featured Reward</p>
               <div class="flex-between">
                 <span style="font-size: 0.85rem; font-weight: 700;">{{ featuredReward.name }}</span>
                 <span class="badge badge-warning" style="font-size: 0.65rem;">{{ featuredReward.pointsCost }} pts</span>
               </div>
               <button class="btn btn-warning btn-sm mt-2" style="width: 100%;" (click)="quickRedeem(featuredReward)" [disabled]="rewardPoints < featuredReward.pointsCost">
                 Quick Redeem
               </button>
            </div>

            <button class="btn btn-secondary btn-sm mt-1" style="width: 100%; font-size: 0.75rem;" routerLink="/rewards">
              View Full Catalog →
            </button>
          </div>

          <!-- QUICK ACTIONS -->
          <div class="glass-card" style="padding: 24px;">
            <h4 style="font-weight: 800; margin-bottom: 16px; font-size: 0.9rem; text-transform: uppercase; color: var(--text-muted);">Quick Actions</h4>
            <div class="action-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <button class="btn btn-secondary btn-sm flex-column" style="padding: 16px;" routerLink="/send-money">
                <span style="font-size: 1.5rem;">💸</span>
                <span>Pay</span>
              </button>
              <button class="btn btn-secondary btn-sm flex-column" style="padding: 16px;" routerLink="/kyc">
                <span style="font-size: 1.5rem;">🆔</span>
                <span>KYC</span>
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: ACTIVITY & STATS -->
        <div class="dashboard-main-col flex-column gap-3">
          <!-- MINI STATS ROW -->
          <div class="stats-row flex gap-2">
            <div class="glass-card stat-mini" style="flex: 1; padding: 16px; text-align: center;">
              <div class="stat-icon blue" style="margin: 0 auto 8px;">📊</div>
              <div class="val" style="font-weight: 700;">{{ totalTransactions }}</div>
              <div class="lbl" style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Transactions</div>
            </div>
            <div class="glass-card stat-mini" style="flex: 1; padding: 16px; text-align: center;">
              <div class="stat-icon cyan" style="margin: 0 auto 8px;">🔔</div>
              <div class="val" style="font-weight: 700;">{{ notificationCount }}</div>
              <div class="lbl" style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Alerts</div>
            </div>
          </div>

          <!-- RECENT TRANSACTIONS TABLE -->
          <div class="glass-card activity-card" style="flex: 1; padding: 24px; min-height: 400px;">
            <div class="flex-between mb-3">
              <h3 style="font-weight: 800; color: var(--text-primary)">Recent Transactions</h3>
              <a routerLink="/transactions" class="btn-text" style="font-size: 0.82rem; color: var(--primary); font-weight: 600; text-decoration: none;">View Full History →</a>
            </div>

            <div class="table-container" style="box-shadow: none; border: 1px solid var(--border); background: transparent;">
              <table>
                <thead>
                  <tr>
                    <th>Direction</th>
                    <th>Reference</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let tx of recentTransactions" style="animation: fadeIn 0.4s ease-out both" [style.animation-delay]="'0.1s'">
                    <td>
                      <div class="flex align-center gap-1">
                        <span class="tx-icon-circle" [class.debit]="tx.senderId == userId" [class.credit]="tx.receiverId == userId">
                          {{ tx.senderId == userId ? '⬆' : '⬇' }}
                        </span>
                        <span style="font-weight: 600;">{{ tx.senderId == userId ? 'Sent' : 'Received' }}</span>
                      </div>
                    </td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">{{ tx.transactionId || tx.id | slice:0:8 }}...</td>
                    <td style="font-weight: 800;" [style.color]="tx.senderId == userId ? 'var(--danger)' : 'var(--success)'">
                      {{ tx.senderId == userId ? '-' : '+' }}₹{{ tx.amount | number:'1.2-2' }}
                    </td>
                    <td>
                      <span class="badge" [class.badge-success]="tx.status === 'SUCCESS' || tx.status === 'COMPLETED'" [class.badge-warning]="tx.status === 'PENDING'" [class.badge-danger]="tx.status === 'FAILED'">
                        {{ tx.status }}
                      </span>
                    </td>
                    <td style="font-size: 0.72rem; color: var(--text-muted);">{{ (tx.createdAt || tx.timestamp) | date:'short' }}</td>
                  </tr>
                  <tr *ngIf="recentTransactions.length === 0">
                    <td colspan="5" class="empty-row text-center" style="padding: 60px; color: var(--text-muted);">
                      <div style="font-size: 2rem; margin-bottom: 10px;">🍃</div>
                      Your transaction history is empty.
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
    .dashboard-container { max-width: 1200px; margin: 0 auto; }
    .dashboard-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 24px;
    }
    .flex-column { display: flex; flex-direction: column; }
    .align-center { align-items: center; }
    
    .premium-wallet-card {
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.25);
      border: none;
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .premium-wallet-card:hover { transform: translateY(-8px) scale(1.02); }
    .card-bg-decoration {
      position: absolute; top: -30%; right: -20%; width: 250px; height: 250px;
      background: radial-gradient(circle, rgba(255,255,255,0.2), transparent);
      z-index: 1; border-radius: 50%;
    }

    .user-avatar-mini { display: flex; align-items: center; gap: 10px; background: white; padding: 6px 16px 6px 6px; border-radius: 100px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
    .avatar-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1rem; }
    .avatar-info { display: flex; flex-direction: column; line-height: 1.2; }
    .avatar-info .name { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }

    .tx-icon-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: white; }
    .tx-icon-circle.debit { background: var(--danger); }
    .tx-icon-circle.credit { background: var(--success); }

    @media (max-width: 992px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
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
    this.loadDashboard();
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

    // Fetch Wallet
    this.walletService.getWallet(this.userId).subscribe({
      next: (w) => { this.walletBalance = w.balance || 0; },
      error: (err) => { console.error('Dashboard: Wallet err', err); }
    });

    // Fetch Transactions
    this.transactionService.getBySender(String(this.userId)).subscribe({
      next: (txs) => { 
        this.totalTransactions = txs.length; 
        this.recentTransactions = txs.sort((a: any, b: any) => 
          new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime()
        ).slice(0, 6); 
      },
      error: (err) => { console.error('Dashboard: TX err', err); }
    });

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

  quickRedeem(item: any) {
    if (this.rewardPoints < item.pointsCost) return;
    this.rewardsService.redeem({ userId: this.userId, catalogItemId: item.id }).subscribe({
      next: () => { alert('Success! Reward redeemed.'); this.loadDashboard(); },
      error: () => alert('Redemption failed. Check your points.')
    });
  }
}

