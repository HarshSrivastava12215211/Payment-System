import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>💸 Send Money</h1>
      <p>Transfer funds instantly to anyone</p>
    </div>

    <div style="max-width: 550px;">
      <div class="glass-card" style="padding: 36px; animation: fadeInUp 0.5s ease-out">
        <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
        <div *ngIf="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

        <div *ngIf="!paymentDone">
          <div class="form-group">
            <label>Receiver ID</label>
            <input class="form-control" type="text" [(ngModel)]="receiverId" placeholder="Enter receiver's user ID">
          </div>
          <div class="form-group">
            <label>Amount</label>
            <input class="form-control" type="number" [(ngModel)]="amount" placeholder="Enter amount" min="0.01">
          </div>
          <div class="form-group">
            <label>Currency</label>
            <select class="form-control" [(ngModel)]="currency">
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <button class="btn btn-primary" style="width: 100%; margin-top: 8px;" (click)="sendPayment()" [disabled]="loading">
            {{ loading ? '⏳ Processing Payment...' : '🚀 Send Payment' }}
          </button>
        </div>

        <div *ngIf="paymentDone" style="text-align: center; padding: 20px 0; animation: scaleIn 0.4s ease-out">
          <div style="font-size: 4rem; margin-bottom: 16px; animation: float 2s ease-in-out infinite;">✅</div>
          <h2 style="font-weight: 700; margin-bottom: 8px;">Payment Successful!</h2>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">{{ amount | currency:currency }} sent to user {{ receiverId }}</p>
          <button class="btn btn-primary" (click)="reset()">Send Another Payment</button>
        </div>
      </div>
    </div>
  `
})
export class SendMoneyComponent {
  private paymentService = inject(PaymentService);
  private auth = inject(AuthService);

  receiverId = '';
  amount = 0;
  currency = 'INR';
  loading = false;
  errorMsg = '';
  successMsg = '';
  paymentDone = false;

  sendPayment() {
    if (!this.receiverId || this.amount <= 0) { this.errorMsg = 'Please fill all fields correctly'; return; }
    this.loading = true;
    this.errorMsg = '';
    const senderId = String(this.auth.getCurrentUserId() || 1);
    const idempotencyKey = this.generateUUID();

    this.paymentService.makePayment({
      senderId, receiverId: this.receiverId, amount: this.amount, currency: this.currency, idempotencyKey
    }).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') { this.paymentDone = true; }
        else { this.errorMsg = res.message || 'Payment was not successful: ' + res.status; }
        this.loading = false;
      },
      error: (err) => { this.errorMsg = err.error?.message || err.error || 'Payment failed'; this.loading = false; }
    });
  }

  reset() {
    this.receiverId = ''; this.amount = 0; this.paymentDone = false;
    this.successMsg = ''; this.errorMsg = '';
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
