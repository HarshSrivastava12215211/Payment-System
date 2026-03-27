import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card glass-card">
        <div class="auth-logo">
          <div class="logo-circle">🚀</div>
        </div>
        <h1>Create Account</h1>
        <p class="subtitle">Join Payment Wallet today</p>

        <div *ngIf="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>

        <!-- Step 1: Form -->
        <div *ngIf="step === 1">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input id="name" class="form-control" type="text" [(ngModel)]="name" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input id="email" class="form-control" type="email" [(ngModel)]="email" placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input id="phone" class="form-control" type="text" [(ngModel)]="phone" placeholder="+91 XXXXXXXXXX">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" class="form-control" type="password" [(ngModel)]="password" placeholder="••••••••">
          </div>
          <button class="btn btn-primary" style="width:100%" (click)="register()" [disabled]="loading">
            {{ loading ? '⏳ Creating Account...' : '✨ Create Account' }}
          </button>
        </div>

        <!-- Step 2: Verification -->
        <div *ngIf="step === 2" style="animation: fadeInUp 0.4s ease-out">
          <p class="subtitle" style="margin-bottom: 20px">Please verify your account. OTP sent to <strong>{{ email }}</strong></p>
          <div class="form-group">
            <label for="regOtp">Enter OTP</label>
            <input id="regOtp" class="form-control" type="text" [(ngModel)]="otp" placeholder="6-digit OTP"
                   maxlength="6" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5em;">
          </div>
          <button class="btn btn-primary" style="width:100%" (click)="verifyRegistration()" [disabled]="loading">
            {{ loading ? '⏳ Verifying...' : '✅ Verify & Activate' }}
          </button>
          <button class="btn btn-secondary mt-2" style="width:100%" (click)="step = 1; otp = ''; errorMsg = ''">
            ← Back to Form
          </button>
        </div>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  step = 1;
  name = '';
  email = '';
  phone = '';
  password = '';
  otp = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  register() {
    if (!this.name || !this.email || !this.phone || !this.password) {
      this.errorMsg = 'All fields are required';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.auth.register({ name: this.name, email: this.email, phone: this.phone, password: this.password, otp: '' }).subscribe({
      next: (msg) => {
        this.successMsg = msg || 'Successfully registered!';
        this.step = 2;
        this.loading = false;
      },
      error: (err) => { this.errorMsg = err.error || 'Registration failed'; this.loading = false; }
    });
  }

  verifyRegistration() {
    if (!this.otp.trim()) { this.errorMsg = 'Please enter the OTP'; return; }
    this.loading = true;
    this.errorMsg = '';
    this.auth.verifyRegistration(this.email, this.otp).subscribe({
      next: (msg) => {
        this.successMsg = msg || 'Account activated!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => { this.errorMsg = err.error || 'Verification failed'; this.loading = false; }
    });
  }
}
