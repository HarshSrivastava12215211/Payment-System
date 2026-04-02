import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper flex-column align-center justify-center p-3">
      <div class="auth-card glass-card p-4 fade-in" style="max-width: 420px; width: 100%; border-top: 5px solid var(--primary);">
        <div class="text-center mb-4">
          <div class="stat-icon blue mx-auto mb-2" style="width: 60px; height: 60px; font-size: 1.5rem;">💎</div>
          <h1 class="font-black text-primary">PayWallet</h1>
          <p class="text-muted" style="font-size: 0.85rem;">Enterprise Digital Asset Management</p>
        </div>

        <div *ngIf="errorMsg" class="badge badge-danger w-full mb-3 p-2 text-center text-sm">⚠️ {{ errorMsg }}</div>
        <div *ngIf="successMsg" class="badge badge-success w-full mb-3 p-2 text-center text-sm">✅ {{ successMsg }}</div>

        <!-- FORM STEPS -->
        <div *ngIf="step === 1" class="fade-in">
          <div class="tabs-container mb-3" style="display: flex; background: rgba(0,0,0,0.05); border-radius: var(--radius-sm); padding: 4px;">
            <button class="flex-1 btn btn-sm" [class.btn-primary]="loginMethod === 'otp'" [class.btn-secondary]="loginMethod !== 'otp'" (click)="loginMethod = 'otp'">OTP Access</button>
            <button class="flex-1 btn btn-sm" [class.btn-primary]="loginMethod === 'password'" [class.btn-secondary]="loginMethod !== 'password'" (click)="loginMethod = 'password'">Password</button>
          </div>

          <div class="form-group">
            <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Identity Endpoint</label>
            <input class="form-control" type="text" [(ngModel)]="identifier" placeholder="Email or Phone">
          </div>

          <div class="form-group" *ngIf="loginMethod === 'password'">
            <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Security Secret</label>
            <input class="form-control" type="password" [(ngModel)]="password" placeholder="••••••••" (keyup.enter)="loginWithPassword()">
          </div>

          <button class="btn btn-primary w-full py-3 font-black mt-2" (click)="loginMethod === 'otp' ? requestOtp() : loginWithPassword()" [disabled]="loading">
            {{ loading ? '⏳ AUTHENTICATING...' : 'SECURE SIGN IN' }}
          </button>
        </div>

        <div *ngIf="step === 2" class="fade-in text-center">
          <div class="stat-icon cyan mx-auto mb-3" style="width: 50px; height: 50px; font-size: 1.2rem;">📩</div>
          <p class="text-muted mb-3" style="font-size: 0.85rem;">Verification code delivered to <br><span class="text-primary font-bold">{{ identifier }}</span></p>
          
          <div class="form-group">
            <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Verification Token</label>
            <input class="form-control text-center font-black" type="text" [(ngModel)]="otp" placeholder="000000" maxlength="6" 
                   style="font-size: 2rem; letter-spacing: 0.4em; height: 60px;" (keyup.enter)="login()">
          </div>
          
          <button class="btn btn-primary w-full py-3 font-black mt-2" (click)="login()" [disabled]="loading || otp.length < 6">
            {{ loading ? '⏳ VERIFYING...' : 'FINALIZE ENTRY' }}
          </button>
          
          <button class="btn btn-text w-full mt-3 text-sm" (click)="step = 1">Try another method</button>
        </div>

        <div class="auth-footer text-center mt-4 pt-3" style="border-top: 1px solid var(--border); font-size: 0.85rem;">
          <span class="text-muted">Domain access required?</span> <a routerLink="/register" class="text-primary font-bold" style="text-decoration: none;">Join Enterprise →</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height: 100vh; background: radial-gradient(circle at top right, rgba(59,130,246,0.05), transparent), radial-gradient(circle at bottom left, rgba(6,182,212,0.05), transparent); }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .justify-center { justify-content: center; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  step = 1;
  loginMethod: 'otp' | 'password' = 'otp';
  identifier = '';
  password = '';
  otp = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  requestOtp() {
    if (!this.identifier.trim()) { this.errorMsg = 'Email or phone is required'; return; }
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.auth.requestOtp(this.identifier).subscribe({
      next: (msg) => {
        this.successMsg = 'OTP sent! Please check your inbox.';
        this.step = 2;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => { 
        this.errorMsg = err.error || 'Connection failed. Please try again later.'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  login() {
    if (!this.otp.trim() || this.otp.length < 6) { this.errorMsg = 'Please enter a valid 6-digit code'; return; }
    this.loading = true;
    this.errorMsg = '';
    console.log('LoginComponent: Authenticating with OTP...');
    this.auth.login(this.identifier, this.otp).subscribe({
      next: (user) => {
        console.log('LoginComponent: Auth success, user:', user);
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => { 
        console.error('LoginComponent: Auth error', err);
        this.errorMsg = err.error?.error || err.error?.message || 'Verification failed. Please check the code and try again.'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  loginWithPassword() {
    if (!this.identifier.trim() || !this.password.trim()) {
      this.errorMsg = 'Identifier and password are required';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    console.log('LoginComponent: Authenticating with password...');
    this.auth.loginWithPassword(this.identifier, this.password).subscribe({
      next: (user) => {
        console.log('LoginComponent: Auth success, user:', user);
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => { 
        console.error('LoginComponent: Auth error', err);
        this.errorMsg = err.error?.error || err.error?.message || 'Invalid credentials. Please verify your identity.'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }
}
