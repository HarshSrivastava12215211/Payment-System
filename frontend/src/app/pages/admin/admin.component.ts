import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { UserDto } from '../../models/user.model';
import { TransactionDTO, DisputeDTO } from '../../models/transaction.model';
import { AdminActionDTO } from '../../models/admin.model';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in" style="max-width: 1200px; margin: 0 auto;">
      <div class="glass-card p-4 mb-3 flex-between align-center" style="border-top: 5px solid var(--danger);">
        <div>
          <h2 class="font-black text-primary mb-1">🛡️ Command & Control Center</h2>
          <p class="text-muted" style="font-size: 0.85rem;">Enterprise-grade oversight of users, transactions, and KYC protocols.</p>
        </div>
        <div class="flex gap-2">
          <button *ngFor="let tab of tabs" 
                  class="btn btn-sm" 
                  [class.btn-primary]="activeTab === tab.id" 
                  [class.btn-secondary]="activeTab !== tab.id"
                  (click)="activeTab = tab.id; loadTab()">
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Users -->
      <div *ngIf="activeTab === 'users'" class="glass-card p-4 fade-in">
        <div class="flex-between align-center mb-3">
          <h3 class="font-black text-primary">👥 Identity Management</h3>
          <button class="btn btn-secondary btn-sm" (click)="loadUsers()">🔄 REFRESH CACHE</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>U-ID</th><th>Subject Name</th><th>Identity Endpoint</th><th>KYC Status</th><th>Access Policy</th><th>Operations</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td style="font-family: monospace; font-size: 0.8rem;">#{{ u.id }}</td>
                <td><strong class="text-primary">{{ u.name }}</strong></td>
                <td class="text-muted" style="font-size: 0.8rem;">{{ u.email }}</td>
                <td>
                  <span class="badge" [class.badge-success]="u.isKycApproved" [class.badge-warning]="!u.isKycApproved">{{ u.isKycApproved ? 'VERIFIED' : 'PENDING' }}</span>
                </td>
                <td>
                  <span class="badge" [class.badge-danger]="u.isBlocked" [class.badge-success]="!u.isBlocked">{{ u.isBlocked ? 'REVOKED' : 'AUTHORIZED' }}</span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-danger px-2" *ngIf="!u.isBlocked" (click)="blockUser(u.id)">REVOKE</button>
                    <button class="btn btn-sm btn-success px-2" *ngIf="u.isBlocked" (click)="unblockUser(u.id)">RESTORE</button>
                    <button class="btn btn-sm btn-primary px-2" *ngIf="!u.isKycApproved" (click)="approveKyc(u.id)">APPROVE</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Transactions -->
      <div *ngIf="activeTab === 'transactions'" class="glass-card p-4 fade-in">
        <div class="flex-between align-center mb-3">
          <h3 class="font-black text-primary">📊 Transaction Ledger</h3>
          <button class="btn btn-danger btn-sm" (click)="loadSuspicious()">⚠️ FLAG SUSPICIOUS</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>TX-HASH</th><th>Origin</th><th>Target</th><th>Volume</th><th>Protocol Status</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let tx of transactions">
                <td style="font-family: monospace; font-size: 0.75rem; color: var(--primary);">{{ tx.transactionId | slice:0:16 }}...</td>
                <td style="font-size: 0.8rem;">User #{{ tx.senderId }}</td>
                <td style="font-size: 0.8rem;">User #{{ tx.receiverId }}</td>
                <td><strong class="text-primary">{{ tx.amount | currency:tx.currency }}</strong></td>
                <td>
                  <span class="badge" [class.badge-success]="tx.status === 'SUCCESS'" [class.badge-warning]="tx.status === 'PENDING'" [class.badge-danger]="tx.status === 'FAILED'">{{ tx.status }}</span>
                </td>
                <td class="text-muted" style="font-size: 0.75rem;">{{ tx.createdAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Complaints -->
      <div *ngIf="activeTab === 'complaints'" class="glass-card p-4 fade-in">
        <div class="flex-between align-center mb-3">
          <h3 class="font-black text-primary">📝 User Complaints</h3>
          <button class="btn btn-secondary btn-sm" (click)="loadComplaints()">🔄 REFRESH</button>
        </div>

        <div *ngIf="disputes.length === 0" class="empty-state py-5 text-center">
          <div class="empty-icon">📭</div>
          <p class="text-muted">No complaints have been filed yet.</p>
        </div>

        <div class="table-container" *ngIf="disputes.length > 0">
          <table>
            <thead>
              <tr><th>DISPUTE ID</th><th>TX-HASH</th><th>USER</th><th>REASON</th><th>STATUS</th><th>RESOLUTION</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of disputes">
                <td style="font-family: monospace; font-size: 0.75rem;">{{ d.id | slice:0:12 }}...</td>
                <td style="font-family: monospace; font-size: 0.75rem; color: var(--primary);">{{ d.transactionId | slice:0:12 }}...</td>
                <td>#{{ d.userId }}</td>
                <td style="font-size: 0.8rem; max-width: 260px;">{{ d.reason }}</td>
                <td>
                  <span class="badge"
                        [class.badge-warning]="d.status === 'OPEN' || d.status === 'UNDER_REVIEW'"
                        [class.badge-success]="d.status === 'RESOLVED'"
                        [class.badge-danger]="d.status === 'REJECTED'">{{ d.status }}</span>
                </td>
                <td style="font-size: 0.78rem;">
                  <input class="form-control" [(ngModel)]="disputeResolution[d.id]" placeholder="Add resolution note" style="min-width: 190px;" />
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-secondary px-2" (click)="updateComplaintStatus(d, 'UNDER_REVIEW')">REVIEW</button>
                    <button class="btn btn-sm btn-success px-2" (click)="updateComplaintStatus(d, 'RESOLVED')">RESOLVE</button>
                    <button class="btn btn-sm btn-danger px-2" (click)="updateComplaintStatus(d, 'REJECTED')">REJECT</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- KYC -->
      <div *ngIf="activeTab === 'kyc'" class="glass-card p-4 fade-in">
        <h3 class="font-black text-primary mb-3">🆔 Document Verification Queue</h3>
        <div *ngIf="kycs.length === 0" class="empty-state py-5 text-center">
          <div class="empty-icon">📭</div>
          <p class="text-muted">No pending document submissions in the buffer.</p>
        </div>
        <div class="table-container" *ngIf="kycs.length > 0">
          <table>
            <thead>
              <tr><th>SUBJECT ID</th><th>LEGAL NAME</th><th>ADHR-TOKEN</th><th>PAN-TOKEN</th><th>SYSTEM STATUS</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let k of kycs">
                <td>#{{ k.userId }}</td>
                <td><strong>{{ k.fullName }}</strong></td>
                <td style="font-family: monospace;">{{ k.aadhaarNumber }}</td>
                <td style="font-family: monospace;">{{ k.panNumber }}</td>
                <td><span class="badge" [class.badge-warning]="k.status === 'PENDING'" [class.badge-success]="k.status === 'APPROVED' || k.status === 'VERIFIED'">{{ k.status || 'SUBMITTED' }}</span></td>
                <td>
                  <div class="flex gap-2" *ngIf="k.status !== 'VERIFIED' && k.status !== 'APPROVED'">
                    <button class="btn btn-sm btn-primary px-2" (click)="approveKyc(k.userId)">APPROVE</button>
                    <button class="btn btn-sm btn-danger px-2" (click)="rejectKyc(k.userId)">REJECT</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Audit -->
      <div *ngIf="activeTab === 'audit'" class="glass-card p-4 fade-in">
        <h3 class="font-black text-primary mb-3">📋 Immutable Audit Log</h3>
        <div *ngIf="auditLog.length === 0" class="empty-state py-5 text-center">
          <div class="empty-icon">📭</div>
          <p class="text-muted">No system-level mutations recorded yet.</p>
        </div>
        <div class="table-container" *ngIf="auditLog.length > 0">
          <table>
            <thead>
              <tr><th>OPERATION</th><th>SUBJECT MAPPING</th><th>PAYLOAD DETAILS</th><th>TIMESTAMP</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of auditLog">
                <td><span class="badge badge-info">{{ a.action }}</span></td>
                <td class="text-muted" style="font-size: 0.8rem;">{{ a.targetType }} :: #{{ a.targetId }}</td>
                <td style="font-size: 0.82rem;">{{ a.details }}</td>
                <td class="text-muted" style="font-size: 0.75rem;">{{ a.createdAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="toastMsg" class="toast-container">
        <div class="toast" [class.toast-success]="toastType === 'success'" [class.toast-error]="toastType === 'error'">{{ toastMsg }}</div>
      </div>
    </div>
  `,
  styles: [`
    .flex { display: flex; }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
  `]
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private txService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);
  tabs=[{id:'users',label:'Users',icon:'👥'},{id:'transactions',label:'Transactions',icon:'📊'},{id:'complaints',label:'Complaints',icon:'📝'},{id:'kyc',label:'KYC',icon:'🆔'},{id:'audit',label:'Audit Log',icon:'📋'}];
  activeTab='users';
  users:UserDto[]=[];transactions:TransactionDTO[]=[];disputes:DisputeDTO[]=[];kycs:any[]=[];auditLog:AdminActionDTO[]=[];
  disputeResolution: Record<string, string> = {};
  toastMsg='';toastType='';

  ngOnInit(){this.loadTab();}
  loadTab(){
    if(this.activeTab==='users')this.loadUsers();
    if(this.activeTab==='transactions')this.loadTransactions();
    if(this.activeTab==='complaints')this.loadComplaints();
    if(this.activeTab==='kyc')this.adminService.getAllKycs().subscribe({next:k=>{this.kycs=k;this.cdr.detectChanges();},error:()=>{}});
    if(this.activeTab==='audit')this.adminService.getAuditLog().subscribe({next:a=>{this.auditLog=a;this.cdr.detectChanges();},error:()=>{}});
  }
  loadUsers(){this.adminService.getUsers().subscribe({next:u=>{this.users=u;this.cdr.detectChanges();},error:()=>{}});}
  loadTransactions(){this.adminService.getTransactions().subscribe({next:t=>{this.transactions=t;this.cdr.detectChanges();},error:()=>{}});}
  loadSuspicious(){this.adminService.getSuspiciousTransactions().subscribe({next:t=>{this.transactions=t;this.cdr.detectChanges();},error:()=>{}});}
  loadComplaints(){
    this.txService.getAllDisputes().subscribe({
      next:d=>{
        this.disputes=(d||[]).sort((a,b)=>new Date(b.createdAt||'').getTime()-new Date(a.createdAt||'').getTime());
        this.cdr.detectChanges();
      },
      error:()=>this.toast('Failed to load complaints','error')
    });
  }
  updateComplaintStatus(d: DisputeDTO, status: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED') {
    const resolution = (this.disputeResolution[d.id] || '').trim();
    const resolvedText = status === 'RESOLVED'
      ? (resolution || 'Resolved by admin team')
      : status === 'REJECTED'
        ? (resolution || 'Rejected after investigation')
        : (resolution || 'Marked for review');

    this.txService.updateDispute(d.id, { status, resolution: resolvedText }).subscribe({
      next:()=>{this.toast('Complaint updated','success');this.loadComplaints();this.cdr.detectChanges();},
      error:()=>this.toast('Failed to update complaint','error')
    });
  }
  blockUser(id:number){this.adminService.blockUser(id).subscribe({next:()=>{this.toast('Blocked','success');this.loadUsers();this.cdr.detectChanges();},error:()=>this.toast('Failed','error')});}
  unblockUser(id:number){this.adminService.unblockUser(id).subscribe({next:()=>{this.toast('Unblocked','success');this.loadUsers();this.cdr.detectChanges();},error:()=>this.toast('Failed','error')});}
  approveKyc(id:number|string){this.adminService.approveKyc(Number(id)).subscribe({next:()=>{this.toast('KYC Approved','success');this.loadUsers();if(this.activeTab==='kyc')this.loadTab();this.cdr.detectChanges();},error:()=>this.toast('Failed','error')});}
  rejectKyc(id:number|string){this.adminService.rejectKyc(Number(id)).subscribe({next:()=>{this.toast('KYC Rejected','success');this.loadUsers();if(this.activeTab==='kyc')this.loadTab();this.cdr.detectChanges();},error:()=>this.toast('Failed','error')});}
  toast(m:string,t:string){this.toastMsg=m;this.toastType=t;setTimeout(()=>this.toastMsg='',3000);}
}
