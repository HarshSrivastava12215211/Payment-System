import { Component, OnInit, inject } from '@angular/core';
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
    <div class="page-header"><h1>🛡️ Admin Panel</h1><p>Manage users, transactions, KYC, and system</p></div>
    <div class="glass-card" style="padding:6px;margin-bottom:24px;display:flex;gap:4px;flex-wrap:wrap;animation:fadeInUp .4s ease-out">
      <button *ngFor="let tab of tabs" class="tab-btn" [class.active]="activeTab===tab.id" (click)="activeTab=tab.id;loadTab()">{{tab.icon}} {{tab.label}}</button>
    </div>

    <!-- Users -->
    <div *ngIf="activeTab==='users'" class="glass-card" style="padding:28px;animation:fadeInUp .4s ease-out">
      <div class="flex-between mb-2"><h3 style="font-weight:700">👥 Users</h3><button class="btn btn-sm btn-secondary" (click)="loadUsers()">🔄</button></div>
      <div class="table-container"><table>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>KYC</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody><tr *ngFor="let u of users">
          <td>{{u.id}}</td><td><strong>{{u.name}}</strong></td><td>{{u.email}}</td>
          <td><span class="badge" [class.badge-success]="u.isKycApproved" [class.badge-warning]="!u.isKycApproved">{{u.isKycApproved?'Approved':'Pending'}}</span></td>
          <td><span class="badge" [class.badge-danger]="u.isBlocked" [class.badge-success]="!u.isBlocked">{{u.isBlocked?'Blocked':'Active'}}</span></td>
          <td><div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-danger" *ngIf="!u.isBlocked" (click)="blockUser(u.id)">Block</button>
            <button class="btn btn-sm btn-success" *ngIf="u.isBlocked" (click)="unblockUser(u.id)">Unblock</button>
            <button class="btn btn-sm btn-primary" *ngIf="!u.isKycApproved" (click)="approveKyc(u.id)">KYC✓</button>
          </div></td>
        </tr></tbody>
      </table></div>
    </div>

    <!-- Transactions -->
    <div *ngIf="activeTab==='transactions'" class="glass-card" style="padding:28px;animation:fadeInUp .4s ease-out">
      <div class="flex-between mb-2"><h3 style="font-weight:700">📊 Transactions</h3>
        <button class="btn btn-sm btn-danger" (click)="loadSuspicious()">⚠️ Suspicious</button></div>
      <div class="table-container"><table>
        <thead><tr><th>ID</th><th>Sender</th><th>Receiver</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody><tr *ngFor="let tx of transactions">
          <td style="font-family:monospace;font-size:.8rem">{{tx.transactionId|slice:0:12}}...</td>
          <td>{{tx.senderId}}</td><td>{{tx.receiverId}}</td>
          <td><strong>{{tx.amount|currency:tx.currency}}</strong></td>
          <td><span class="badge" [class.badge-success]="tx.status==='SUCCESS'" [class.badge-warning]="tx.status==='PENDING'" [class.badge-danger]="tx.status==='FAILED'">{{tx.status}}</span></td>
          <td>{{tx.createdAt|date:'short'}}</td>
        </tr></tbody>
      </table></div>
    </div>

    <!-- KYC -->
    <div *ngIf="activeTab==='kyc'" class="glass-card" style="padding:28px;animation:fadeInUp .4s ease-out">
      <h3 style="font-weight:700;margin-bottom:16px">🆔 KYC Submissions</h3>
      <div *ngIf="kycs.length===0" class="empty-state" style="padding:30px"><div class="empty-icon">📭</div><p>No KYC submissions</p></div>
      <div class="table-container" *ngIf="kycs.length>0"><table>
        <thead><tr><th>User ID</th><th>Name</th><th>Aadhaar</th><th>PAN</th><th>Status</th></tr></thead>
        <tbody><tr *ngFor="let k of kycs"><td>{{k.userId}}</td><td>{{k.fullName}}</td><td>{{k.aadhaarNumber}}</td><td>{{k.panNumber}}</td><td><span class="badge badge-info">{{k.status||'SUBMITTED'}}</span></td></tr></tbody>
      </table></div>
    </div>

    <!-- Audit -->
    <div *ngIf="activeTab==='audit'" class="glass-card" style="padding:28px;animation:fadeInUp .4s ease-out">
      <h3 style="font-weight:700;margin-bottom:16px">📋 Audit Log</h3>
      <div *ngIf="auditLog.length===0" class="empty-state" style="padding:30px"><div class="empty-icon">📭</div><p>No entries</p></div>
      <div class="table-container" *ngIf="auditLog.length>0"><table>
        <thead><tr><th>Action</th><th>Target</th><th>Details</th><th>Date</th></tr></thead>
        <tbody><tr *ngFor="let a of auditLog"><td><span class="badge badge-info">{{a.action}}</span></td><td>{{a.targetType}} #{{a.targetId}}</td><td>{{a.details}}</td><td>{{a.createdAt|date:'short'}}</td></tr></tbody>
      </table></div>
    </div>

    <div *ngIf="toastMsg" class="toast-container"><div class="toast" [class.toast-success]="toastType==='success'" [class.toast-error]="toastType==='error'">{{toastMsg}}</div></div>
  `,
  styles: [`.tab-btn{padding:10px 20px;border:none;background:transparent;border-radius:var(--radius-sm);font-family:'Inter',sans-serif;font-size:.85rem;font-weight:500;color:var(--text-secondary);cursor:pointer;transition:var(--transition)}.tab-btn:hover{background:rgba(59,130,246,.06)}.tab-btn.active{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;box-shadow:0 4px 12px rgba(59,130,246,.3)}`]
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  tabs=[{id:'users',label:'Users',icon:'👥'},{id:'transactions',label:'Transactions',icon:'📊'},{id:'kyc',label:'KYC',icon:'🆔'},{id:'audit',label:'Audit Log',icon:'📋'}];
  activeTab='users';
  users:UserDto[]=[];transactions:TransactionDTO[]=[];kycs:any[]=[];auditLog:AdminActionDTO[]=[];
  toastMsg='';toastType='';

  ngOnInit(){this.loadTab();}
  loadTab(){
    if(this.activeTab==='users')this.loadUsers();
    if(this.activeTab==='transactions')this.loadTransactions();
    if(this.activeTab==='kyc')this.adminService.getAllKycs().subscribe({next:k=>this.kycs=k,error:()=>{}});
    if(this.activeTab==='audit')this.adminService.getAuditLog().subscribe({next:a=>this.auditLog=a,error:()=>{}});
  }
  loadUsers(){this.adminService.getUsers().subscribe({next:u=>this.users=u,error:()=>{}});}
  loadTransactions(){this.adminService.getTransactions().subscribe({next:t=>this.transactions=t,error:()=>{}});}
  loadSuspicious(){this.adminService.getSuspiciousTransactions().subscribe({next:t=>this.transactions=t,error:()=>{}});}
  blockUser(id:number){this.adminService.blockUser(id).subscribe({next:()=>{this.toast('Blocked','success');this.loadUsers();},error:()=>this.toast('Failed','error')});}
  unblockUser(id:number){this.adminService.unblockUser(id).subscribe({next:()=>{this.toast('Unblocked','success');this.loadUsers();},error:()=>this.toast('Failed','error')});}
  approveKyc(id:number){this.adminService.approveKyc(id).subscribe({next:()=>{this.toast('KYC Approved','success');this.loadUsers();},error:()=>this.toast('Failed','error')});}
  toast(m:string,t:string){this.toastMsg=m;this.toastType=t;setTimeout(()=>this.toastMsg='',3000);}
}
