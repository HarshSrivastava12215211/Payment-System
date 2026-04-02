import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { TransactionDTO } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="glass-card p-2 mb-3">
        <div class="flex-between flex-wrap gap-2">
          <div class="flex align-center gap-2">
            <label class="font-bold text-muted mt-1" style="font-size: 0.8rem; text-transform: uppercase;">Filter By Status:</label>
            <select class="form-control" style="max-width: 180px;" [(ngModel)]="filterStatus" (change)="applyFilter()">
              <option value="">All Transactions</option>
              <option value="SUCCESS">Success Only</option>
              <option value="PENDING">Pending Only</option>
              <option value="FAILED">Failed Only</option>
              <option value="COMPLETED">Completed Only</option>
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" (click)="loadTransactions()">🔄 Refresh Ledger</button>
        </div>
      </div>

      <div class="glass-card p-4 fade-in-up" style="animation-delay: 0.1s; min-height: 500px;">
        <div *ngIf="filteredTransactions.length === 0" class="empty-state">
          <div class="empty-icon">📭</div><p>No transaction records found matching the criteria</p>
        </div>
        <div class="table-container" *ngIf="filteredTransactions.length > 0">
          <table>
            <thead><tr><th>Reference ID</th><th>Origin</th><th>Destination</th><th>Volume</th><th>State</th><th>Timestamp</th><th>Management</th></tr></thead>
            <tbody>
              <tr *ngFor="let tx of filteredTransactions" class="fade-in">
                <td style="font-family: monospace; font-size: 0.8rem;" class="text-primary font-bold">{{ tx.transactionId | slice:0:12 }}...</td>
                <td class="text-muted">#{{ tx.senderId }}</td>
                <td class="text-muted">#{{ tx.receiverId }}</td>
                <td><strong class="text-primary">{{ tx.amount | currency:tx.currency }}</strong></td>
                <td>
                  <span class="badge"
                    [class.badge-success]="tx.status === 'SUCCESS' || tx.status === 'COMPLETED'"
                    [class.badge-warning]="tx.status === 'PENDING'"
                    [class.badge-danger]="tx.status === 'FAILED' || tx.status === 'REJECTED'">{{ tx.status }}</span>
                </td>
                <td class="text-muted" style="font-size: 0.82rem;">{{ tx.createdAt | date:'medium' }}</td>
                <td><button class="btn btn-sm btn-secondary" (click)="openDispute(tx)">⚠️ Dispute</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL FOR DISPUTE -->
      <div class="modal-overlay" *ngIf="showDisputeModal" (click)="showDisputeModal = false">
        <div class="modal-content glass-card" (click)="$event.stopPropagation()">
          <h3 class="font-bold text-primary">⚠️ Raise Support Ticket</h3>
          <p class="text-secondary mb-3" style="font-size: 0.85rem;">Reporting Ref: <span class="font-bold">{{ selectedTx?.transactionId | slice:0:16 }}...</span></p>
          <div class="form-group">
            <label>Detailed Reason</label>
            <textarea class="form-control" [(ngModel)]="disputeReason" rows="4" placeholder="Please describe the discrepancy in detail..."></textarea>
          </div>
          <div class="flex gap-2 justify-end mt-3">
            <button class="btn btn-secondary" (click)="showDisputeModal = false">Discard</button>
            <button class="btn btn-danger" (click)="submitDispute()">Submit Report</button>
          </div>
        </div>
      </div>

      <div *ngIf="toastMsg" class="toast-container">
        <div class="toast" [class.toast-success]="toastType==='success'" [class.toast-error]="toastType==='error'">{{ toastMsg }}</div>
      </div>
    </div>
  `
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  private auth = inject(AuthService);

  transactions: TransactionDTO[] = [];
  filteredTransactions: TransactionDTO[] = [];
  filterStatus = '';
  showDisputeModal = false;
  selectedTx: TransactionDTO | null = null;
  disputeReason = '';
  toastMsg = '';
  toastType = '';
  userId = 0;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.userId = this.auth.getCurrentUserId() || 1;
    this.loadTransactions();
    this.refreshTimer = setInterval(() => this.loadTransactions(), 5000);
  }

  loadTransactions() {
    this.txService.getUserTimeline(this.userId).subscribe({
      next: (txs) => { this.transactions = txs; this.applyFilter(); }, error: () => {}
    });
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  applyFilter() {
    this.filteredTransactions = this.filterStatus
      ? this.transactions.filter(t => t.status === this.filterStatus) : [...this.transactions];
  }

  openDispute(tx: TransactionDTO) {
    this.selectedTx = tx; this.disputeReason = ''; this.showDisputeModal = true;
  }

  submitDispute() {
    if (!this.disputeReason.trim() || !this.selectedTx) return;
    this.txService.createDispute({ transactionId: this.selectedTx.transactionId, userId: this.userId, reason: this.disputeReason }).subscribe({
      next: () => { this.showDisputeModal = false; this.showToast('Dispute raised!', 'success'); },
      error: () => this.showToast('Failed', 'error')
    });
  }

  showToast(msg: string, type: string) {
    this.toastMsg = msg; this.toastType = type; setTimeout(() => this.toastMsg = '', 3000);
  }
}
