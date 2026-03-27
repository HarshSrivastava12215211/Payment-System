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
      <div class="sidebar-brand"><h2>💳 Pay<span>Wallet</span></h2><p>Digital Payments Platform</p></div>
      <div class="sidebar-nav">
        <div class="sidebar-section">Main</div>
        <a routerLink="/dashboard" routerLinkActive="active"><span class="nav-icon">📊</span><span>Dashboard</span></a>
        <a routerLink="/wallet" routerLinkActive="active"><span class="nav-icon">💳</span><span>My Wallet</span></a>
        <a routerLink="/send-money" routerLinkActive="active"><span class="nav-icon">💸</span><span>Send Money</span></a>
        <a routerLink="/transactions" routerLinkActive="active"><span class="nav-icon">📄</span><span>Transactions</span></a>
        <div class="sidebar-section">Account</div>
        <a routerLink="/kyc" routerLinkActive="active"><span class="nav-icon">🆔</span><span>KYC Verification</span></a>
        <a routerLink="/notifications" routerLinkActive="active"><span class="nav-icon">🔔</span><span>Notifications</span></a>
        <a routerLink="/rewards" routerLinkActive="active"><span class="nav-icon">🎁</span><span>Rewards</span></a>
        <div class="sidebar-section">Management</div>
        <a routerLink="/admin" routerLinkActive="active"><span class="nav-icon">🛡️</span><span>Admin Panel</span></a>
      </div>
      <div class="sidebar-footer">
        <button class="btn btn-secondary btn-sm" style="width:100%;color:rgba(255,255,255,.7);border-color:rgba(255,255,255,.15)" (click)="logout()">🚪 Sign Out</button>
      </div>
    </nav>
    <main class="main-content"><router-outlet></router-outlet></main>
  `
})
export class LayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
