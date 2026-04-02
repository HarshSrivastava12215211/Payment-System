import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper flex-column align-center justify-center p-3">
      <div class="auth-card glass-card p-4 fade-in" style="max-width: 480px; width: 100%; border-top: 5px solid var(--accent);">
        <div class="text-center mb-4">
          <div class="stat-icon cyan mx-auto mb-2" style="width: 60px; height: 60px; font-size: 1.5rem;">🚀</div>
          <h1 class="font-black text-primary">Join PayWallet</h1>
          <p class="text-muted" style="font-size: 0.85rem;">Establish your secure digital footprint</p>
        </div>

        <div *ngIf="errorMsg" class="badge badge-danger w-full mb-3 p-2 text-center text-sm">⚠️ {{ errorMsg }}</div>
        <div *ngIf="successMsg" class="badge badge-success w-full mb-3 p-2 text-center text-sm">✅ {{ successMsg }}</div>

        <!-- FORM STEPS -->
        <div *ngIf="step === 1" class="fade-in">
          <div class="dashboard-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group col-span-2">
              <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Legal Identity</label>
              <input class="form-control" type="text" [(ngModel)]="name" placeholder="Full Legal Name">
            </div>
            <div class="form-group">
              <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Primary Email</label>
              <input class="form-control" type="email" [(ngModel)]="email" placeholder="name@company.com">
            </div>
            <div class="form-group">
              <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Direct Phone</label>
              <input class="form-control" type="text" [(ngModel)]="phone" placeholder="+91 XXXX...">
            </div>
            <div class="form-group col-span-2">
              <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Security Secret</label>
              <input class="form-control" type="password" [(ngModel)]="password" placeholder="Minimum 8 characters">
            </div>
          </div>

          <button class="btn btn-primary w-full py-3 font-black mt-3" (click)="register()" [disabled]="loading">
            {{ loading ? '⏳ INITIALIZING CORE...' : 'CREATE ENTERPRISE ACCOUNT' }}
          </button>
        </div>

        <div *ngIf="step === 2" class="fade-in text-center">
          <div class="stat-icon blue mx-auto mb-3" style="width: 50px; height: 50px; font-size: 1.2rem;">🛡️</div>
          <p class="text-muted mb-3" style="font-size: 0.85rem;">Verification required for <br><span class="text-primary font-bold">{{ email }}</span></p>
          
          <div class="form-group">
            <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Activation Code</label>
            <input class="form-control text-center font-black" type="text" [(ngModel)]="otp" placeholder="000000" maxlength="6" 
                   style="font-size: 2rem; letter-spacing: 0.4em; height: 60px;">
          </div>
          
          <button class="btn btn-primary w-full py-3 font-black mt-2" (click)="verifyRegistration()" [disabled]="loading || otp.length < 6">
            {{ loading ? '⏳ ACTIVATING...' : 'VERIFY & COMPUTE' }}
          </button>
          
          <button class="btn btn-text w-full mt-3 text-sm" (click)="step = 1">Back to identification</button>
        </div>

        <div class="auth-footer text-center mt-4 pt-3" style="border-top: 1px solid var(--border); font-size: 0.85rem;">
          <span class="text-muted">Existing domain member?</span> <a routerLink="/login" class="text-primary font-bold" style="text-decoration: none;">Sign In →</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height: 100vh; background: radial-gradient(circle at top left, rgba(59,130,246,0.05), transparent), radial-gradient(circle at bottom right, rgba(16,185,129,0.05), transparent); }
    .col-span-2 { grid-column: span 2; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .justify-center { justify-content: center; }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

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
        this.cdr.detectChanges();
      },
      error: (err) => { 
        this.errorMsg = err.error || 'Registration failed'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  verifyRegistration() {
    if (!this.otp.trim()) { this.errorMsg = 'Please enter the OTP'; return; }
    this.loading = true;
    this.errorMsg = '';
    this.auth.verifyRegistration(this.email, this.otp).subscribe({
      next: (msg) => {
        this.successMsg = msg || 'Account activated!';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => { 
        this.errorMsg = err.error || 'Verification failed'; 
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
