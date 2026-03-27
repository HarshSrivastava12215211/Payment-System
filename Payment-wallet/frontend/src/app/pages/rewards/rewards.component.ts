import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RewardsService } from '../../services/rewards.service';
import { AuthService } from '../../services/auth.service';
import { RewardPointsDTO, PointsTransactionDTO, CatalogItemDTO } from '../../models/rewards.model';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>🎁 Rewards</h1>
      <p>Earn points and redeem rewards</p>
    </div>
    <div class="stats-grid" style="margin-bottom:28px">
      <div class="stat-card glass-card"><div class="stat-icon orange">⭐</div><div class="stat-value">{{userPoints?.totalPoints||0}}</div><div class="stat-label">Total Points</div></div>
      <div class="stat-card glass-card"><div class="stat-icon cyan">🏆</div><div class="stat-value">{{userPoints?.tier||'BRONZE'}}</div><div class="stat-label">Current Tier</div></div>
    </div>
    <div class="glass-card" style="padding:28px;margin-bottom:28px;animation:fadeInUp .5s ease-out .15s both">
      <h3 style="font-weight:700;margin-bottom:20px">🛍️ Catalog</h3>
      <div *ngIf="catalog.length===0" class="empty-state" style="padding:30px"><div class="empty-icon">🎪</div><p>No items</p></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
        <div *ngFor="let item of catalog" class="card-3d" style="overflow:hidden;animation:fadeInUp .5s ease-out both">
          <div style="padding:24px;text-align:center;background:linear-gradient(135deg,rgba(59,130,246,.06),rgba(14,165,233,.06))"><span style="font-size:2rem">🎁</span></div>
          <div style="padding:20px"><h4 style="font-weight:700;margin-bottom:6px">{{item.name}}</h4><p style="font-size:.82rem;color:var(--text-secondary);margin-bottom:14px">{{item.description}}</p>
            <div style="display:flex;justify-content:space-between;align-items:center"><span class="badge badge-info">{{item.pointsCost}} pts</span><button class="btn btn-sm btn-primary" (click)="redeem(item)" [disabled]="(userPoints?.totalPoints||0)<item.pointsCost">Redeem</button></div>
          </div>
        </div>
      </div>
    </div>
    <div class="glass-card" style="padding:28px;animation:fadeInUp .5s ease-out .25s both">
      <h3 style="font-weight:700;margin-bottom:16px">📊 Points History</h3>
      <div *ngIf="history.length===0" class="empty-state" style="padding:30px"><div class="empty-icon">📭</div><p>No history</p></div>
      <div class="table-container" *ngIf="history.length>0">
        <table><thead><tr><th>Type</th><th>Points</th><th>Description</th><th>Date</th></tr></thead>
          <tbody><tr *ngFor="let h of history"><td><span class="badge" [class.badge-success]="h.type==='EARN'" [class.badge-danger]="h.type==='REDEEM'">{{h.type}}</span></td><td><strong>{{h.points}}</strong></td><td>{{h.description}}</td><td>{{h.createdAt|date:'short'}}</td></tr></tbody>
        </table>
      </div>
    </div>
    <div *ngIf="toastMsg" class="toast-container"><div class="toast" [class.toast-success]="toastType==='success'" [class.toast-error]="toastType==='error'">{{toastMsg}}</div></div>
  `
})
export class RewardsComponent implements OnInit {
  private rewardsService = inject(RewardsService);
  private auth = inject(AuthService);
  userPoints: RewardPointsDTO|null = null;
  catalog: CatalogItemDTO[] = [];
  history: PointsTransactionDTO[] = [];
  toastMsg=''; toastType='';

  ngOnInit() {
    const uid = this.auth.getCurrentUserId()||1;
    this.rewardsService.getUserPoints(uid).subscribe({next:p=>this.userPoints=p,error:()=>{}});
    this.rewardsService.getActiveCatalog().subscribe({next:c=>this.catalog=c,error:()=>{}});
    this.rewardsService.getPointsHistory(uid).subscribe({next:h=>this.history=h,error:()=>{}});
  }
  redeem(item: CatalogItemDTO) {
    const uid = this.auth.getCurrentUserId()||1;
    this.rewardsService.redeem({userId:uid,catalogItemId:item.id}).subscribe({
      next:()=>{this.showToast('Redeemed!','success');this.ngOnInit();},error:()=>this.showToast('Failed','error')
    });
  }
  showToast(m:string,t:string){this.toastMsg=m;this.toastType=t;setTimeout(()=>this.toastMsg='',3000);}
}
