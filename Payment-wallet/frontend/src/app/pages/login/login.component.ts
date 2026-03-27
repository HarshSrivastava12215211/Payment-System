import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card glass-card" style="animation: scaleIn 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);">
        <div class="auth-logo">
          <div class="logo-circle grad-blue float-animation">💳</div>
        </div>
        <h1 style="background: linear-gradient(135deg, var(--text-primary), var(--primary-dark)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Welcome Back
        </h1>
        <p class="subtitle">Sign in to your digital world</p>

        <div *ngIf="errorMsg" class="alert alert-error" style="animation: slideInRight 0.3s ease-out">
          <span style="font-weight: 700;">⚠ Error:</span> {{ errorMsg }}
        </div>
        <div *ngIf="successMsg" class="alert alert-success" style="animation: slideInRight 0.3s ease-out">
          <span style="font-weight: 700;">✓ Success:</span> {{ successMsg }}
        </div>

        <!-- Login Method Toggle -->
        <div class="tabs-container" *ngIf="step === 1">
          <div class="tab" [class.active]="loginMethod === 'otp'" (click)="loginMethod = 'otp'">📩 OTP</div>
          <div class="tab" [class.active]="loginMethod === 'password'" (click)="loginMethod = 'password'">🔐 Password</div>
        </div>

        <!-- Step 1: Login Form -->
        <div *ngIf="step === 1" style="animation: fadeIn 0.4s ease-out">
          <div class="form-group">
            <label for="identifier">EMAIL OR PHONE</label>
            <input id="identifier" class="form-control" type="text"
                   [(ngModel)]="identifier" placeholder="e.g. user@example.com">
          </div>

          <div class="form-group" *ngIf="loginMethod === 'password'" style="animation: fadeInUp 0.3s ease-out">
            <label for="password">PASSWORD</label>
            <input id="password" class="form-control" type="password"
                   [(ngModel)]="password" placeholder="••••••••"
                   (keyup.enter)="loginWithPassword()">
          </div>

          <button *ngIf="loginMethod === 'otp'" class="btn btn-primary" style="width:100%; height: 50px;" (click)='requestOtp()' [disabled]="loading">
            {{ loading ? '⏳ Sending OTP...' : 'Get Security Code' }}
          </button>
          
          <button *ngIf="loginMethod === 'password'" class="btn btn-primary" style="width:100%; height: 50px;" (click)="loginWithPassword()" [disabled]="loading">
            {{ loading ? '⏳ Signing In...' : 'Verify & Log In' }}
          </button>

          <div class="text-center mt-3" style="font-size: 0.75rem; opacity: 0.6;">
            <a href="javascript:void(0)" (click)="step = 2" style="color: var(--text-muted)">Testing mode: Enter random OTP</a>
          </div>
        </div>

        <!-- Step 2: Enter OTP -->
        <div *ngIf="step === 2" style="animation: fadeInUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          <div class="text-center mb-3">
             <div class="otp-sent-icon" style="font-size: 2rem; margin-bottom: 10px;">📫</div>
             <p style="font-size: 0.88rem; color: var(--text-secondary);">
               A 6-digit security code was sent to <br><strong>{{ identifier }}</strong>
             </p>
          </div>
          
          <div class="form-group">
            <label for="otp" style="text-align: center;">ENTER 6-DIGIT CODE</label>
            <input id="otp" class="form-control" type="text"
                   [(ngModel)]="otp" placeholder="000000"
                   (keyup.enter)="login()" maxlength="6"
                   style="text-align: center; font-size: 2rem; letter-spacing: 0.3em; font-weight: 800; color: var(--primary-dark); height: 60px;">
          </div>
          
          <button class="btn btn-primary" style="width:100%; height: 50px;" (click)="login()" [disabled]="loading || otp.length < 6">
            {{ loading ? '⏳ Verifying Code...' : 'Authenticate' }}
          </button>
          
          <button class="btn btn-secondary mt-2" style="width:100%" (click)="step = 1; otp = ''; errorMsg = ''">
            ← Use Different Login Method
          </button>

          <div class="text-center mt-3">
             <a href="javascript:void(0)" (click)="requestOtp()" style="font-size: 0.8rem; color: var(--primary); font-weight: 600; text-decoration: none;">
               Resend Code
             </a>
          </div>
        </div>

        <div class="auth-footer">
          New to PayWallet? <a routerLink="/register">Create an account</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

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
      },
      error: (err) => { 
        this.errorMsg = err.error || 'Connection failed. Please try again later.'; 
        this.loading = false; 
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
        this.router.navigate(['/dashboard']);
      },
      error: (err) => { 
        console.error('LoginComponent: Auth error', err);
        this.errorMsg = 'Verification failed. Please check the code and try again.'; 
        this.loading = false; 
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
        this.router.navigate(['/dashboard']);
      },
      error: (err) => { 
        console.error('LoginComponent: Auth error', err);
        this.errorMsg = 'Invalid credentials. Please verify your identity.'; 
        this.loading = false; 
      }
    });
  }
}
