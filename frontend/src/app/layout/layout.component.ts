import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <div class="sidebar-brand">
        <h2>💳 Pay<span>Wallet</span></h2>
        <p>Enterprise Edition</p>
      </div>
      <div class="sidebar-nav">
        <div class="sidebar-section">Main Dashboard</div>
        <a routerLink="/dashboard" routerLinkActive="active"><span class="nav-icon">📊</span><span>Overview</span></a>
        <a routerLink="/wallet" routerLinkActive="active"><span class="nav-icon">💳</span><span>My Wallet</span></a>
        
        <div class="sidebar-section">Payments & activity</div>
        <a routerLink="/send-money" routerLinkActive="active"><span class="nav-icon">💸</span><span>Send Money</span></a>
        <a routerLink="/transactions" routerLinkActive="active"><span class="nav-icon">📄</span><span>History</span></a>
        
        <div class="sidebar-section">Account Security</div>
        <a routerLink="/kyc" routerLinkActive="active"><span class="nav-icon">🆔</span><span>Identity (KYC)</span></a>
        <a routerLink="/notifications" routerLinkActive="active"><span class="nav-icon">🔔</span><span>Alerts</span></a>
        <a routerLink="/rewards" routerLinkActive="active"><span class="nav-icon">🎁</span><span>Benefits</span></a>
        
        <div class="sidebar-section" *ngIf="user?.role === 'ADMIN'">System</div>
        <a routerLink="/admin" routerLinkActive="active" *ngIf="user?.role === 'ADMIN'"><span class="nav-icon">🛡️</span><span>Administration</span></a>
      </div>
      <div class="sidebar-footer">
        <button class="btn btn-secondary btn-sm w-full" style="color:rgba(255,255,255,.7);border-color:rgba(255,255,255,.15)" (click)="logout()">🚪 Logout</button>
      </div>
    </nav>
    
    <div class="main-wrapper">
      <header class="top-header glass-card">
        <div class="header-left">
          <span class="page-title">{{ getPageTitle() }}</span>
        </div>
        <div class="header-right">
          <div class="user-profile-summary" *ngIf="user">
            <div class="profile-info">
              <span class="profile-name">{{ user.name }}</span>
              <span class="profile-role text-muted">{{ user.role }}</span>
            </div>
            <div class="profile-avatar grad-blue">{{ user.name.charAt(0) }}</div>
          </div>
        </div>
      </header>
      <main class="main-content fade-in">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .main-wrapper { margin-left: 260px; display: flex; flex-direction: column; min-height: 100vh; }
    .top-header { 
      height: 70px; margin: 20px 30px 10px; padding: 0 24px; 
      display: flex; justify-content: space-between; align-items: center; 
      z-index: 900; background: rgba(255,255,255,0.8);
    }
    .page-title { font-weight: 800; font-size: 1.1rem; color: var(--text-primary); }
    .user-profile-summary { display: flex; align-items: center; gap: 12px; }
    .profile-info { display: flex; flex-direction: column; text-align: right; line-height: 1.2; }
    .profile-name { font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
    .profile-role { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .profile-avatar { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; }
    
    .sidebar-section { color: rgba(255,255,255,0.4); font-size: 0.65rem; margin-top: 20px; text-transform: uppercase; font-weight: 700; padding: 0 16px 8px; }
    
    @media (max-width: 768px) {
      .main-wrapper { margin-left: 70px; }
      .top-header { margin: 10px; }
    }
  `]
})
export class LayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  user = this.auth.getCurrentUser();

  logout() { this.auth.logout(); this.router.navigate(['/login']); }
  
  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'System Overview';
    if (url.includes('wallet')) return 'Wallet Management';
    if (url.includes('send-money')) return 'Direct Transfer';
    if (url.includes('transactions')) return 'Transaction Ledger';
    if (url.includes('kyc')) return 'Identity Verification';
    if (url.includes('notifications')) return 'Security Alerts';
    if (url.includes('rewards')) return 'Rewards & Loyalty';
    if (url.includes('admin')) return 'Administration Panel';
    return 'PayWallet';
  }
}
