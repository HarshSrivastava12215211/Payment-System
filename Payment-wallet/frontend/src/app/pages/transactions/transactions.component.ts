import { Component, OnInit, inject } from '@angular/core';
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
    <div class="page-header">
      <h1>📄 Transactions</h1>
      <p>View your transaction history and raise disputes</p>
    </div>

    <div class="glass-card" style="padding: 20px; margin-bottom: 24px; animation: fadeInUp 0.5s ease-out;">
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <select class="form-control" style="max-width: 200px;" [(ngModel)]="filterStatus" (change)="applyFilter()">
          <option value="">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <button class="btn btn-sm btn-secondary" (click)="loadTransactions()">🔄 Refresh</button>
      </div>
    </div>

    <div class="glass-card" style="padding: 24px; animation: fadeInUp 0.5s ease-out 0.1s both;">
      <div *ngIf="filteredTransactions.length === 0" class="empty-state">
        <div class="empty-icon">📭</div><p>No transactions found</p>
      </div>
      <div class="table-container" *ngIf="filteredTransactions.length > 0">
        <table>
          <thead><tr><th>Transaction ID</th><th>Sender</th><th>Receiver</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            <tr *ngFor="let tx of filteredTransactions">
              <td style="font-family: monospace; font-size: 0.8rem;">{{ tx.transactionId | slice:0:12 }}...</td>
              <td>{{ tx.senderId }}</td>
              <td>{{ tx.receiverId }}</td>
              <td><strong>{{ tx.amount | currency:tx.currency }}</strong></td>
              <td>
                <span class="badge"
                  [class.badge-success]="tx.status === 'SUCCESS' || tx.status === 'COMPLETED'"
                  [class.badge-warning]="tx.status === 'PENDING'"
                  [class.badge-danger]="tx.status === 'FAILED' || tx.status === 'REJECTED'">{{ tx.status }}</span>
              </td>
              <td>{{ tx.createdAt | date:'short' }}</td>
              <td><button class="btn btn-sm btn-secondary" (click)="openDispute(tx)">⚠️ Dispute</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showDisputeModal" (click)="showDisputeModal = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>⚠️ Raise Dispute</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">Transaction: {{ selectedTx?.transactionId | slice:0:16 }}...</p>
        <div class="form-group">
          <label>Reason</label>
          <textarea class="form-control" [(ngModel)]="disputeReason" rows="3" placeholder="Describe the issue..."></textarea>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-secondary" (click)="showDisputeModal = false">Cancel</button>
          <button class="btn btn-danger" (click)="submitDispute()">Submit Dispute</button>
        </div>
      </div>
    </div>

    <div *ngIf="toastMsg" class="toast-container">
      <div class="toast" [class.toast-success]="toastType==='success'" [class.toast-error]="toastType==='error'">{{ toastMsg }}</div>
    </div>
  `
})
export class TransactionsComponent implements OnInit {
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

  ngOnInit() {
    this.userId = this.auth.getCurrentUserId() || 1;
    this.loadTransactions();
  }

  loadTransactions() {
    this.txService.getBySender(String(this.userId)).subscribe({
      next: (txs) => { this.transactions = txs; this.applyFilter(); }, error: () => {}
    });
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
