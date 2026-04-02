import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { UserDto } from '../../models/user.model';
import { TransactionDTO } from '../../models/transaction.model';
import { AdminActionDTO } from '../../models/admin.model';

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
  private cdr = inject(ChangeDetectorRef);
  tabs=[{id:'users',label:'Users',icon:'👥'},{id:'transactions',label:'Transactions',icon:'📊'},{id:'kyc',label:'KYC',icon:'🆔'},{id:'audit',label:'Audit Log',icon:'📋'}];
  activeTab='users';
  users:UserDto[]=[];transactions:TransactionDTO[]=[];kycs:any[]=[];auditLog:AdminActionDTO[]=[];
  toastMsg='';toastType='';

  ngOnInit(){this.loadTab();}
  loadTab(){
    if(this.activeTab==='users')this.loadUsers();
    if(this.activeTab==='transactions')this.loadTransactions();
    if(this.activeTab==='kyc')this.adminService.getAllKycs().subscribe({next:k=>{this.kycs=k;this.cdr.detectChanges();},error:()=>{}});
    if(this.activeTab==='audit')this.adminService.getAuditLog().subscribe({next:a=>{this.auditLog=a;this.cdr.detectChanges();},error:()=>{}});
  }
  loadUsers(){this.adminService.getUsers().subscribe({next:u=>{this.users=u;this.cdr.detectChanges();},error:()=>{}});}
  loadTransactions(){this.adminService.getTransactions().subscribe({next:t=>{this.transactions=t;this.cdr.detectChanges();},error:()=>{}});}
  loadSuspicious(){this.adminService.getSuspiciousTransactions().subscribe({next:t=>{this.transactions=t;this.cdr.detectChanges();},error:()=>{}});}
  blockUser(id:number){this.adminService.blockUser(id).subscribe({next:()=>{this.toast('Blocked','success');this.loadUsers();this.cdr.detectChanges();},error:()=>this.toast('Failed','error')});}
  unblockUser(id:number){this.adminService.unblockUser(id).subscribe({next:()=>{this.toast('Unblocked','success');this.loadUsers();this.cdr.detectChanges();},error:()=>this.toast('Failed','error')});}
  approveKyc(id:number|string){this.adminService.approveKyc(Number(id)).subscribe({next:()=>{this.toast('KYC Approved','success');this.loadUsers();if(this.activeTab==='kyc')this.loadTab();this.cdr.detectChanges();},error:()=>this.toast('Failed','error')});}
  rejectKyc(id:number|string){this.adminService.rejectKyc(Number(id)).subscribe({next:()=>{this.toast('KYC Rejected','success');this.loadUsers();if(this.activeTab==='kyc')this.loadTab();this.cdr.detectChanges();},error:()=>this.toast('Failed','error')});}
  toast(m:string,t:string){this.toastMsg=m;this.toastType=t;setTimeout(()=>this.toastMsg='',3000);}
}
