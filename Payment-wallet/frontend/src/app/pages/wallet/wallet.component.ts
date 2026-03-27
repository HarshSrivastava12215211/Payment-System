import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../../services/wallet.service';
import { AuthService } from '../../services/auth.service';
import { WalletDTO, LedgerEntryDTO, WalletLimitDTO } from '../../models/wallet.model';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>💳 My Wallet</h1>
      <p>Manage your wallet, add funds, and view ledger</p>
    </div>

    <div class="wallet-hero glass-card" style="padding: 32px; margin-bottom: 28px; animation: fadeInUp 0.5s ease-out;
         background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; border: none;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
        <div>
          <p style="opacity: 0.7; font-size: 0.85rem; margin-bottom: 6px;">Available Balance</p>
          <div style="font-size: 2.4rem; font-weight: 800; letter-spacing: -0.03em;">
            {{ wallet?.balance | currency:(wallet?.currency || 'INR') }}
          </div>
          <p style="opacity: 0.6; font-size: 0.82rem; margin-top: 8px;">Wallet ID: {{ wallet?.walletId || '---' }}</p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <span *ngIf="wallet?.frozen" class="badge" style="background: rgba(239,68,68,0.3); color: white; font-size: 0.82rem; padding: 6px 14px;">🔒 Frozen</span>
          <span *ngIf="wallet && !wallet.frozen" class="badge" style="background: rgba(16,185,129,0.3); color: white; font-size: 0.82rem; padding: 6px 14px;">✅ Active</span>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 28px;">
      <div class="glass-card" style="padding: 28px; animation: fadeInUp 0.5s ease-out 0.1s both">
        <h3 style="font-weight: 700; margin-bottom: 16px; font-size: 1rem;">💰 Add Money</h3>
        <div class="form-group">
          <label>Amount</label>
          <input class="form-control" type="number" [(ngModel)]="creditAmount" placeholder="Enter amount" min="1">
        </div>
        <button class="btn btn-success" style="width: 100%" (click)="credit()" [disabled]="loading">{{ loading ? '⏳...' : '+ Add Funds' }}</button>
      </div>
      <div class="glass-card" style="padding: 28px; animation: fadeInUp 0.5s ease-out 0.15s both">
        <h3 style="font-weight: 700; margin-bottom: 16px; font-size: 1rem;">💸 Withdraw</h3>
        <div class="form-group">
          <label>Amount</label>
          <input class="form-control" type="number" [(ngModel)]="debitAmount" placeholder="Enter amount" min="1">
        </div>
        <button class="btn btn-danger" style="width: 100%" (click)="debit()" [disabled]="loading">{{ loading ? '⏳...' : '- Withdraw Funds' }}</button>
      </div>
    </div>

    <div class="glass-card" style="padding: 24px; margin-bottom: 28px; animation: fadeInUp 0.5s ease-out 0.2s both">
      <div class="flex-between">
        <h3 style="font-weight: 700; font-size: 1rem;">🔧 Wallet Controls</h3>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-sm btn-danger" *ngIf="wallet && !wallet.frozen" (click)="freeze()">🔒 Freeze</button>
          <button class="btn btn-sm btn-success" *ngIf="wallet?.frozen" (click)="unfreeze()">🔓 Unfreeze</button>
          <button class="btn btn-sm btn-secondary" (click)="downloadStatement()">📥 Export CSV</button>
        </div>
      </div>
    </div>

    <div *ngIf="limits" class="glass-card" style="padding: 28px; margin-bottom: 28px; animation: fadeInUp 0.5s ease-out 0.25s both">
      <h3 style="font-weight: 700; margin-bottom: 16px; font-size: 1rem;">📊 Wallet Limits</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Daily Limit</p>
          <div class="limit-bar"><div class="limit-fill" [style.width.%]="getLimitPct(limits.dailyUsed, limits.dailyLimit)"></div></div>
          <p style="font-size: 0.82rem; margin-top: 4px;">{{ limits.dailyUsed | currency:'INR' }} / {{ limits.dailyLimit | currency:'INR' }}</p>
        </div>
        <div>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Monthly Limit</p>
          <div class="limit-bar"><div class="limit-fill" [style.width.%]="getLimitPct(limits.monthlyUsed, limits.monthlyLimit)"></div></div>
          <p style="font-size: 0.82rem; margin-top: 4px;">{{ limits.monthlyUsed | currency:'INR' }} / {{ limits.monthlyLimit | currency:'INR' }}</p>
        </div>
      </div>
    </div>

    <div *ngIf="toastMsg" class="toast-container">
      <div class="toast" [class.toast-success]="toastType==='success'" [class.toast-error]="toastType==='error'">{{ toastMsg }}</div>
    </div>

    <div class="glass-card" style="padding: 28px; animation: fadeInUp 0.5s ease-out 0.3s both">
      <h3 style="font-weight: 700; margin-bottom: 16px; font-size: 1rem;">📒 Transaction Ledger</h3>
      <div *ngIf="ledger.length === 0" class="empty-state" style="padding: 30px">
        <div class="empty-icon">📭</div><p>No ledger entries yet</p>
      </div>
      <div class="table-container" *ngIf="ledger.length > 0">
        <table>
          <thead><tr><th>Type</th><th>Amount</th><th>Reference</th><th>Balance After</th><th>Date</th></tr></thead>
          <tbody>
            <tr *ngFor="let entry of ledger">
              <td><span class="badge" [class.badge-success]="entry.type === 'CREDIT'" [class.badge-danger]="entry.type === 'DEBIT'">{{ entry.type }}</span></td>
              <td><strong>{{ entry.amount | currency:'INR' }}</strong></td>
              <td style="font-family: monospace; font-size: 0.82rem;">{{ entry.referenceType }}</td>
              <td>{{ entry.balanceAfter | currency:'INR' }}</td>
              <td>{{ entry.createdAt | date:'short' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .limit-bar { height: 8px; background: var(--bg-secondary); border-radius: 100px; overflow: hidden; margin-top: 8px; }
    .limit-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 100px; transition: width 1s ease; }
  `]
})
export class WalletComponent implements OnInit {
  private walletService = inject(WalletService);
  private auth = inject(AuthService);

  wallet: WalletDTO | null = null;
  ledger: LedgerEntryDTO[] = [];
  limits: WalletLimitDTO | null = null;
  creditAmount = 0;
  debitAmount = 0;
  loading = false;
  toastMsg = '';
  toastType = '';
  userId = 0;

  ngOnInit() {
    this.userId = this.auth.getCurrentUserId() || 1;
    this.loadWallet();
  }

  getLimitPct(used: number, limit: number): number {
    return limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  }

  loadWallet() {
    this.walletService.getWallet(this.userId).subscribe({ next: (w) => this.wallet = w, error: () => {} });
    this.walletService.getLedger(this.userId).subscribe({ next: (l) => this.ledger = l, error: () => {} });
    this.walletService.getWalletLimits(this.userId).subscribe({ next: (l) => this.limits = l, error: () => {} });
  }

  credit() {
    if (this.creditAmount <= 0) { this.showToast('Enter a valid amount', 'error'); return; }
    this.loading = true;
    this.walletService.credit({ userId: this.userId, amount: this.creditAmount, currency: 'INR' }).subscribe({
      next: (w) => { this.wallet = w; this.showToast('Funds added!', 'success'); this.loadWallet(); this.loading = false; this.creditAmount = 0; },
      error: (e) => { this.showToast(e.error || 'Failed', 'error'); this.loading = false; }
    });
  }

  debit() {
    if (this.debitAmount <= 0) { this.showToast('Enter a valid amount', 'error'); return; }
    this.loading = true;
    this.walletService.debit({ userId: this.userId, amount: this.debitAmount, currency: 'INR' }).subscribe({
      next: (w) => { this.wallet = w; this.showToast('Withdrawn!', 'success'); this.loadWallet(); this.loading = false; this.debitAmount = 0; },
      error: (e) => { this.showToast(e.error || 'Failed', 'error'); this.loading = false; }
    });
  }

  freeze() {
    this.walletService.freezeWallet(this.userId).subscribe({
      next: () => { this.showToast('Wallet frozen', 'success'); this.loadWallet(); },
      error: () => this.showToast('Failed', 'error')
    });
  }

  unfreeze() {
    this.walletService.unfreezeWallet(this.userId).subscribe({
      next: () => { this.showToast('Wallet unfrozen', 'success'); this.loadWallet(); },
      error: () => this.showToast('Failed', 'error')
    });
  }

  downloadStatement() {
    this.walletService.exportStatementCsv(this.userId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `statement_${this.userId}.csv`; a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.showToast('Failed to download', 'error')
    });
  }

  showToast(msg: string, type: string) {
    this.toastMsg = msg; this.toastType = type;
    setTimeout(() => this.toastMsg = '', 3000);
  }
}
