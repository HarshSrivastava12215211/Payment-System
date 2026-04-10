import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
    <div class="fade-in">
      <div class="wallet-hero grad-blue p-4 mb-3 premium-shadow text-white" style="border-radius: var(--radius-lg); position: relative; overflow: hidden; border: none;">
        <div class="card-bg-decoration"></div>
        <div class="flex-between relative z-2">
          <div>
            <p style="opacity: 0.7; font-size: 0.85rem;" class="mb-1">Portfolio Balance</p>
            <div class="font-black" style="font-size: 2.8rem; letter-spacing: -0.03em;">
              {{ wallet?.balance | currency:(wallet?.currency || 'INR') }}
            </div>
            <p style="opacity: 0.6; font-size: 0.82rem;" class="mt-2">Account #{{ wallet?.walletId || '---' }}</p>
          </div>
          <div class="flex gap-1 align-center">
            <span *ngIf="wallet?.frozen" class="badge" style="background: rgba(239,68,68,0.3); color: white;">Locked</span>
            <span *ngIf="wallet && !wallet.frozen" class="badge" style="background: rgba(16,185,129,0.3); color: white;">Verified Active</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid mb-3">
        <div class="glass-card p-3 fade-in-up" style="animation-delay: 0.1s">
          <h3 class="font-bold text-primary mb-3" style="font-size: 1rem;">Deposit Funds</h3>
          <div class="form-group">
            <label>Amount</label>
            <input class="form-control" type="number" [(ngModel)]="creditAmount" placeholder="0.00" min="1">
          </div>
          <button class="btn btn-success w-full" (click)="credit()" [disabled]="creditLoading">{{ creditLoading ? 'Processing...' : '+ Quick Deposit' }}</button>
        </div>

        <div class="glass-card p-3 fade-in-up" style="animation-delay: 0.2s">
          <h3 class="font-bold text-primary mb-3" style="font-size: 1rem;">Fast Withdrawal</h3>
          <div class="form-group">
            <label>Amount</label>
            <input class="form-control" type="number" [(ngModel)]="debitAmount" placeholder="0.00" min="1">
          </div>
          <button class="btn btn-danger w-full" (click)="debit()" [disabled]="debitLoading">{{ debitLoading ? 'Processing...' : '- Instant Withdraw' }}</button>
        </div>
      </div>

      <div class="glass-card p-3 mb-3 fade-in-up" style="animation-delay: 0.3s">
        <div class="flex-between">
          <h3 class="font-bold text-primary" style="font-size: 1rem;">Safety & Controls</h3>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-danger" *ngIf="wallet && !wallet.frozen" (click)="freeze()">Enable Lock</button>
            <button class="btn btn-sm btn-success" *ngIf="wallet?.frozen" (click)="unfreeze()">Release Lock</button>
            <button class="btn btn-sm btn-secondary" (click)="downloadStatement()">Download Ledger</button>
          </div>
        </div>
      </div>

      <div *ngIf="limits" class="glass-card p-3 mb-3 fade-in-up" style="animation-delay: 0.4s">
        <h3 class="font-bold text-primary mb-3" style="font-size: 1rem;">Usage Metrics</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <p class="text-muted" style="font-size: 0.82rem;">24h Transaction Limit</p>
            <div class="limit-bar"><div class="limit-fill" [style.width.%]="getLimitPct(limits.dailyUsed, limits.dailyLimit)"></div></div>
            <p class="font-bold mt-1" style="font-size: 0.82rem;">{{ limits.dailyUsed | currency:'INR' }} / {{ limits.dailyLimit | currency:'INR' }}</p>
          </div>
          <div>
            <p class="text-muted" style="font-size: 0.82rem;">Monthly Volume Limit</p>
            <div class="limit-bar"><div class="limit-fill" [style.width.%]="getLimitPct(limits.monthlyUsed, limits.monthlyLimit)"></div></div>
            <p class="font-bold mt-1" style="font-size: 0.82rem;">{{ limits.monthlyUsed | currency:'INR' }} / {{ limits.monthlyLimit | currency:'INR' }}</p>
          </div>
        </div>
      </div>

      <div class="glass-card p-4 fade-in-up" style="animation-delay: 0.5s">
        <h3 class="font-bold text-primary mb-3" style="font-size: 1rem;">Real-time Ledger</h3>
        <div *ngIf="ledger.length === 0" class="empty-state">
          <div class="empty-icon">...</div><p>No ledger entries recorded yet</p>
        </div>
        <div class="table-container" *ngIf="ledger.length > 0">
          <table>
            <thead><tr><th>Nature</th><th>Volume</th><th>Classification</th><th>Net Balance</th><th>Timestamp</th></tr></thead>
            <tbody>
              <tr *ngFor="let entry of ledger" class="fade-in">
                <td><span class="badge" [class.badge-success]="entry.type === 'CREDIT'" [class.badge-danger]="entry.type === 'DEBIT'">{{ entry.type }}</span></td>
                <td><strong class="text-primary">{{ entry.amount | currency:'INR' }}</strong></td>
                <td class="text-muted" style="font-family: monospace; font-size: 0.82rem;">{{ entry.referenceType }}</td>
                <td><span class="font-bold">{{ entry.balanceAfter | currency:'INR' }}</span></td>
                <td class="text-muted" style="font-size: 0.82rem;">{{ entry.createdAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div *ngIf="toastMsg" class="toast-container">
      <div class="toast" [class.toast-success]="toastType==='success'" [class.toast-error]="toastType==='error'">{{ toastMsg }}</div>
    </div>
  `,
  styles: [`
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .card-bg-decoration { position: absolute; top: -30%; right: -20%; width: 250px; height: 250px; background: radial-gradient(circle, rgba(255,255,255,0.2), transparent); z-index: 1; border-radius: 50%; }
    .limit-bar { height: 8px; background: #e2e8f0; border-radius: 100px; overflow: hidden; margin-top: 8px; }
    .limit-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 100px; transition: width 1s ease; }
    .relative { position: relative; }
    .z-2 { z-index: 2; }
    @media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; } }
  `]
})
export class WalletComponent implements OnInit {
  private walletService = inject(WalletService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  wallet: WalletDTO | null = null;
  ledger: LedgerEntryDTO[] = [];
  limits: WalletLimitDTO | null = null;
  creditAmount = 0;
  debitAmount = 0;
  creditLoading = false;
  debitLoading = false;
  toastMsg = '';
  toastType = '';
  userId = 0;

  ngOnInit() {
    this.userId = this.auth.getCurrentUserId() || 1;
    const cachedWallet = this.walletService.getCachedWallet(this.userId);
    if (cachedWallet) {
      this.wallet = cachedWallet;
    }
    this.loadWallet();
  }

  getLimitPct(used: number, limit: number): number {
    return limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  }

  loadWallet() {
    this.walletService.getWallet(this.userId).subscribe({
      next: (w) => this.wallet = w,
      error: () => {
        const cachedWallet = this.walletService.getCachedWallet(this.userId);
        if (cachedWallet) this.wallet = cachedWallet;
      }
    });
    this.walletService.getLedger(this.userId).subscribe({ next: (l) => this.ledger = l, error: () => {} });
    this.walletService.getWalletLimits(this.userId).subscribe({ next: (l) => this.limits = l, error: () => {} });
  }

  credit() {
    if (this.creditAmount <= 0) { this.showToast('Enter a valid amount', 'error'); return; }
    this.creditLoading = true;
    this.cdr.detectChanges();
    this.walletService.credit({ userId: this.userId, amount: this.creditAmount, currency: 'INR' }).subscribe({
      next: (w) => {
        this.wallet = w;
        this.showToast('Funds added!', 'success');
        this.loadWallet();
        this.creditLoading = false;
        this.creditAmount = 0;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.showToast(e.error || 'Failed', 'error');
        this.creditLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  debit() {
    if (this.debitAmount <= 0) { this.showToast('Enter a valid amount', 'error'); return; }
    this.debitLoading = true;
    this.cdr.detectChanges();
    this.walletService.debit({ userId: this.userId, amount: this.debitAmount, currency: 'INR' }).subscribe({
      next: (w) => {
        this.wallet = w;
        this.showToast('Withdrawn!', 'success');
        this.loadWallet();
        this.debitLoading = false;
        this.debitAmount = 0;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.showToast(e.error || 'Failed', 'error');
        this.debitLoading = false;
        this.cdr.detectChanges();
      }
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
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement_${this.userId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.showToast('Failed to download', 'error')
    });
  }

  showToast(msg: string, type: string) {
    this.toastMsg = msg;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => { 
      this.toastMsg = ''; 
      this.cdr.detectChanges();
    }, 3000);
  }
}
