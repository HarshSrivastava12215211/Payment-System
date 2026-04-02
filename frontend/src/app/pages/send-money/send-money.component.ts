import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in" style="max-width: 600px; margin: 0 auto;">
      <div class="glass-card p-4 mb-3" style="border-left: 4px solid var(--accent);">
        <h2 class="font-black text-primary mb-1">💸 Direct Asset Transfer</h2>
        <p class="text-muted" style="font-size: 0.85rem;">Execute instant peer-to-peer cloud transactions.</p>
      </div>

      <div class="glass-card p-4 fade-in-up" style="animation-delay: 0.1s;">
        <div *ngIf="errorMsg" class="badge badge-danger mb-3 w-full p-2 text-center" style="border-radius: var(--radius-sm);">⚠️ {{ errorMsg }}</div>

        <div *ngIf="!paymentDone">
          <div class="flex gap-2 mb-4 justify-center">
            <button class="btn btn-sm flex-1" [class.btn-primary]="paymentMode === 'DIRECT'" [class.btn-secondary]="paymentMode !== 'DIRECT'" (click)="paymentMode = 'DIRECT'">Direct Wallet Transfer</button>
            <button class="btn btn-sm flex-1" [class.btn-primary]="paymentMode === 'RAZORPAY'" [class.btn-secondary]="paymentMode !== 'RAZORPAY'" (click)="paymentMode = 'RAZORPAY'">Gateway Top-up & Transfer</button>
          </div>
          
          <div class="form-group">
            <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Destination Identifier</label>
            <input class="form-control" type="text" [(ngModel)]="receiverId" placeholder="Receiver User ID (e.g. 102)">
          </div>

          <div class="dashboard-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
              <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Transaction Volume</label>
              <input class="form-control font-black" type="number" [(ngModel)]="amount" placeholder="0.00" min="0.01" style="font-size: 1.2rem;">
            </div>
            <div class="form-group">
              <label class="font-bold text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Currency Unit</label>
              <select class="form-control" [(ngModel)]="currency">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div class="mt-4 pt-3" style="border-top: 1px solid var(--border);">
            <button class="btn btn-primary w-full py-3 font-black" (click)="sendPayment()" [disabled]="loading" style="font-size: 1rem; letter-spacing: 1px;">
              {{ loading ? '⏳ EXECUTING PROTOCOL...' : '🚀 AUTHORIZE DISBURSEMENT' }}
            </button>
            <p class="text-center text-muted mt-2" style="font-size: 0.7rem;">Transactions are finalized instantly and cannot be reversed.</p>
          </div>
        </div>

        <div *ngIf="paymentDone" class="text-center py-4 fade-in">
          <div class="stat-icon emerald mx-auto mb-3" style="width: 80px; height: 80px; font-size: 2.5rem; margin: 0 auto;">✅</div>
          <h2 class="font-black text-primary">Transaction Confirmed</h2>
          <div class="glass-card mb-4 p-3 mt-3" style="background: rgba(0,0,0,0.02);">
            <p class="text-muted mb-1" style="font-size: 0.8rem;">Amount Dispatched</p>
            <h1 class="text-success font-black">{{ amount | currency:currency }}</h1>
            <p class="text-muted mt-2" style="font-size: 0.75rem;">To User Mapping: <span class="font-bold text-primary">#{{ receiverId }}</span></p>
          </div>
          <button class="btn btn-secondary w-full" (click)="reset()">Initiate New Transfer</button>
        </div>
      </div>

      <div class="mt-4 p-3 flex align-center gap-2" style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.6;">
        <span>🔒</span>
        <p>Encrypted Idempotency Key: {{ generateUUID() | slice:0:18 }}...</p>
      </div>
    </div>
  `
})
export class SendMoneyComponent {
  private paymentService = inject(PaymentService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  receiverId = '';
  amount = 0;
  currency = 'INR';
  paymentMode = 'DIRECT';
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

    if (this.paymentMode === 'DIRECT') {
      this.paymentService.makePayment({
        senderId,
        receiverId: this.receiverId,
        amount: this.amount,
        currency: this.currency,
        idempotencyKey
      }).subscribe({
        next: () => {
          this.paymentDone = true;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMsg = err.error?.message || err.error || 'Transfer failed';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
      return;
    }

    // 1. Create Order via Backend
    this.paymentService.createRazorpayOrder(this.amount, this.currency, `rec_${Date.now()}`).subscribe({
      next: (orderInfo) => {
        const options = {
          key: 'rzp_test_SYf3NJn6LPhYax', // Public API Key
          amount: orderInfo.amount,
          currency: orderInfo.currency,
          name: 'PayWallet Transfer',
          description: `Transfer to User #${this.receiverId}`,
          order_id: orderInfo.orderId,
          handler: (response: any) => {
             // 2. Verify Payment
             this.paymentService.verifyRazorpayPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                senderId: senderId,
                receiverId: this.receiverId,
                amount: this.amount,
                currency: this.currency,
                idempotencyKey: idempotencyKey
             }).subscribe({
                next: (verifyRes) => {
                   this.paymentDone = true;
                   this.loading = false;
                   this.cdr.detectChanges();
                },
                error: (verifyErr) => {
                   this.errorMsg = verifyErr.error || 'Payment verification failed';
                   this.loading = false;
                   this.cdr.detectChanges();
                }
             });
          },
          prefill: {
            name: this.auth.getCurrentUser()?.name || '',
            email: this.auth.getCurrentUser()?.email || ''
          },
          theme: { color: '#3b82f6' }
        };
        
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
           this.errorMsg = 'Payment failed during checkout';
           this.loading = false;
           this.cdr.detectChanges();
        });
        rzp.open();
      },
      error: (err) => {
        // Fallback flow for local/dev usage when gateway keys are not configured or gateway is unavailable.
        this.paymentService.processGatewayFallbackTransfer({
          senderId,
          receiverId: this.receiverId,
          amount: this.amount,
          currency: this.currency,
          idempotencyKey
        }).subscribe({
          next: () => {
            this.paymentDone = true;
            this.loading = false;
            this.successMsg = 'Gateway unavailable, transfer completed in fallback mode.';
            this.cdr.detectChanges();
          },
          error: (fallbackErr) => {
            this.errorMsg = fallbackErr.error?.message || fallbackErr.error || err.error?.message || err.error || 'Failed to initialize payment';
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  reset() {
    this.receiverId = ''; this.amount = 0; this.paymentDone = false;
    this.successMsg = ''; this.errorMsg = '';
  }

  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
