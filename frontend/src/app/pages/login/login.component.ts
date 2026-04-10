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
    <div class="landing-wrapper">
      <section class="landing-hero fade-in-up">
        <div class="brand-pill">PAYWALLET PLATFORM</div>
        <h1>Move money smarter with a secure, real-time wallet network.</h1>
        <p>
          Unified payments, fraud screening, rewards, and account protection in one light and modern workspace.
        </p>

        <div class="hero-cards">
          <article class="hero-card">
            <h3>Fast Transfers</h3>
            <p>Instant movement across wallets with live status tracking.</p>
          </article>
          <article class="hero-card">
            <h3>Fraud Checks</h3>
            <p>Every transaction is screened for risk before completion.</p>
          </article>
          <article class="hero-card">
            <h3>Reward Engine</h3>
            <p>Track points and redemption journeys in one dashboard.</p>
          </article>
        </div>
      </section>

      <section class="auth-card glass-card fade-in" style="border-top: 5px solid var(--primary);">
        <div class="text-center mb-4">
          <div class="auth-logo-mark">PW</div>
          <h2 class="font-black text-primary">Sign In</h2>
          <p class="text-muted" style="font-size: 0.85rem;">Welcome back to your payment workspace</p>
        </div>

        <div *ngIf="errorMsg" class="badge badge-danger w-full mb-3 p-2 text-center text-sm">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="badge badge-success w-full mb-3 p-2 text-center text-sm">{{ successMsg }}</div>

        <div *ngIf="step === 1" class="fade-in">
          <div class="tabs-container mb-3" style="display: flex; background: rgba(42, 112, 214, 0.08); border-radius: var(--radius-sm); padding: 4px;">
            <button class="flex-1 btn btn-sm" [class.btn-primary]="loginMethod === 'otp'" [class.btn-secondary]="loginMethod !== 'otp'" (click)="loginMethod = 'otp'">OTP Login</button>
            <button class="flex-1 btn btn-sm" [class.btn-primary]="loginMethod === 'password'" [class.btn-secondary]="loginMethod !== 'password'" (click)="loginMethod = 'password'">Password</button>
          </div>

          <div class="form-group">
            <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Email or phone</label>
            <input class="form-control" type="text" [(ngModel)]="identifier" placeholder="name@example.com or +91..." />
          </div>

          <div class="form-group" *ngIf="loginMethod === 'password'">
            <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Password</label>
            <input class="form-control" type="password" [(ngModel)]="password" placeholder="Enter your password" (keyup.enter)="loginWithPassword()" />
          </div>

          <button class="btn btn-primary w-full py-3 font-black mt-2" (click)="loginMethod === 'otp' ? requestOtp() : loginWithPassword()" [disabled]="loading">
            {{ loading ? 'Authenticating...' : 'Secure Sign In' }}
          </button>
        </div>

        <div *ngIf="step === 2" class="fade-in text-center">
          <p class="text-muted mb-3" style="font-size: 0.85rem;">Verification code sent to <br><span class="text-primary font-bold">{{ identifier }}</span></p>

          <div class="form-group">
            <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Verification code</label>
            <input class="form-control text-center font-black" type="text" [(ngModel)]="otp" placeholder="000000" maxlength="6"
                   style="font-size: 2rem; letter-spacing: 0.4em; height: 60px;" (keyup.enter)="login()" />
          </div>

          <button class="btn btn-primary w-full py-3 font-black mt-2" (click)="login()" [disabled]="loading || otp.length < 6">
            {{ loading ? 'Verifying...' : 'Finalize Entry' }}
          </button>

          <button class="btn btn-text w-full mt-3 text-sm" (click)="step = 1">Use another method</button>
        </div>

        <div class="auth-footer text-center mt-4 pt-3" style="border-top: 1px solid var(--border); font-size: 0.85rem;">
          <span class="text-muted">New to PayWallet?</span> <a routerLink="/register" class="text-primary font-bold" style="text-decoration: none;">Create account</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-wrapper {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1.2fr 0.95fr;
      gap: 26px;
      padding: 26px;
      background:
        radial-gradient(circle at 20% 20%, rgba(92, 157, 255, 0.20), transparent 45%),
        radial-gradient(circle at 90% 90%, rgba(140, 209, 255, 0.20), transparent 40%),
        linear-gradient(180deg, #f6fbff 0%, #eef6ff 100%);
    }

    .landing-hero {
      border-radius: 28px;
      padding: 34px;
      background: linear-gradient(160deg, rgba(255,255,255,0.85), rgba(224, 241, 255, 0.55));
      border: 1px solid rgba(89, 156, 255, 0.2);
      box-shadow: 0 20px 45px rgba(52, 114, 211, 0.14);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .brand-pill {
      display: inline-flex;
      width: fit-content;
      background: rgba(56, 135, 247, 0.14);
      color: #1e4ea8;
      border: 1px solid rgba(56, 135, 247, 0.22);
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      margin-bottom: 16px;
    }

    .landing-hero h1 {
      font-size: clamp(1.8rem, 3.2vw, 2.8rem);
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 10px;
      color: #12325f;
    }

    .landing-hero p {
      font-size: 0.98rem;
      line-height: 1.65;
      color: #35608f;
      max-width: 48ch;
    }

    .hero-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 24px;
    }

    .hero-card {
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid rgba(96, 163, 255, 0.2);
      border-radius: 16px;
      padding: 14px;
      backdrop-filter: blur(8px);
    }

    .hero-card h3 {
      font-size: 0.9rem;
      margin-bottom: 6px;
      color: #14407f;
    }

    .hero-card p {
      font-size: 0.8rem;
      color: #54779e;
      margin: 0;
      line-height: 1.45;
    }

    .auth-card {
      max-width: 460px;
      width: 100%;
      margin: auto;
      padding: 30px;
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.9);
    }

    .auth-logo-mark {
      width: 54px;
      height: 54px;
      margin: 0 auto 12px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      font-size: 0.95rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #fff;
      background: linear-gradient(145deg, #4f98ff, #1d56bd);
      box-shadow: 0 14px 28px rgba(40, 105, 214, 0.32);
    }

    @media (max-width: 1080px) {
      .landing-wrapper {
        grid-template-columns: 1fr;
      }

      .hero-cards {
        grid-template-columns: 1fr;
      }

      .auth-card {
        max-width: none;
      }
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  step = 1;
  loginMethod: 'otp' | 'password' = 'password';
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
        this.errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || err.message || 'Connection failed. Please try again later.'); 
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
        if (err?.status === 503) {
          this.errorMsg = 'Services are still starting. Please retry in 20-30 seconds.';
        } else if (err?.status === 0) {
          this.errorMsg = 'Cannot reach server. Please ensure containers are running.';
        } else {
          this.errorMsg = err.error?.error || err.error?.message || 'Verification failed. Please check the code and try again.';
        }
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
        if (err?.status === 503) {
          this.errorMsg = 'Services are still starting. Please retry in 20-30 seconds.';
        } else if (err?.status === 0) {
          this.errorMsg = 'Cannot reach server. Please ensure containers are running.';
        } else {
          this.errorMsg = err.error?.error || err.error?.message || 'Invalid credentials. Please verify your identity.';
        }
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }
}
