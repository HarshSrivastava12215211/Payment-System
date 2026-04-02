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
    <div class="fade-in" style="max-width: 1000px; margin: 0 auto;">
      <div class="glass-card p-3 mb-3" style="border-left: 4px solid #f59e0b;">
        <h2 class="font-black text-primary mb-1">🎁 Logic Rewards Program</h2>
        <p class="text-muted" style="font-size: 0.82rem;">Accumulate points through ecosystem activities and unlock premium perks.</p>
      </div>

      <div class="dashboard-grid mb-3">
        <div class="glass-card stat-card-mini flex align-center gap-3">
          <div class="stat-icon-circle amber">⭐</div>
          <div>
            <p class="text-muted" style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800;">Available Credits</p>
            <h2 class="font-black text-primary">{{ userPoints?.totalPoints || 0 }}</h2>
          </div>
        </div>
        <div class="glass-card stat-card-mini flex align-center gap-3">
          <div class="stat-icon-circle cyan">🏆</div>
          <div>
            <p class="text-muted" style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800;">Ecosystem Tier</p>
            <h2 class="font-black" style="color: var(--primary);">{{ userPoints?.tier || 'BRONZE' }}</h2>
          </div>
        </div>
      </div>

      <div class="glass-card p-4 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="flex-between align-center mb-3">
          <h3 class="font-black text-primary">🛍️ Redemption Catalog</h3>
          <span class="badge badge-info">{{ catalog.length }} CURATED ITEMS</span>
        </div>
        
        <div *ngIf="catalog.length === 0" class="empty-state py-5">
          <div class="empty-icon">🎪</div>
          <p class="text-muted">No reward artifacts available for your tier.</p>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
          <div *ngFor="let item of catalog" class="glass-card p-0 flex-column h-full transition-all hover-up overflow-hidden" style="background: rgba(255,255,255,0.3);">
            <div class="p-4 text-center" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), transparent);">
              <span style="font-size: 2.5rem;">🎁</span>
            </div>
            <div class="p-3 flex-1 flex-column">
              <h4 class="font-bold text-primary mb-1">{{ item.name }}</h4>
              <p class="text-secondary mb-3 flex-1" style="font-size: 0.8rem;">{{ item.description }}</p>
              <div class="flex-between align-center mt-auto pt-2" style="border-top: 1px solid var(--border);">
                <span class="font-black text-amber" style="font-size: 0.9rem;">{{ item.pointsCost }} <span style="font-size: 0.7rem;">PTS</span></span>
                <button class="btn btn-primary btn-sm px-3" (click)="redeem(item)" [disabled]="(userPoints?.totalPoints || 0) < item.pointsCost">
                  REDEEM
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-4 fade-in-up" style="animation-delay: 0.2s;">
        <h3 class="font-black text-primary mb-3">📖 Transaction Ledger (Points)</h3>
        <div *ngIf="history.length === 0" class="empty-state py-4 text-center">
          <p class="text-muted">No historical point distributions detected.</p>
        </div>
        <div class="table-container" *ngIf="history.length > 0">
          <table>
            <thead>
              <tr><th>Classification</th><th>Magnitude</th><th>Source Protocol</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of history">
                <td>
                  <span class="badge" [class.badge-success]="h.type === 'EARN'" [class.badge-danger]="h.type === 'REDEEM'">{{ h.type }}</span>
                </td>
                <td><strong class="text-primary">{{ h.points }}</strong></td>
                <td class="text-muted" style="font-size: 0.8rem;">{{ h.description }}</td>
                <td class="text-muted" style="font-size: 0.8rem;">{{ h.createdAt | date:'medium' }}</td>
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
    .stat-card-mini { padding: 15px 20px; }
    .stat-icon-circle { width: 45px; height: 45px; border-radius: 50%; display: flex; align-center: center; justify-content: center; font-size: 1.2rem; }
    .amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .text-amber { color: #f59e0b; }
    .transition-all { transition: all 0.3s ease; }
    .hover-up:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    .h-full { height: 100%; }
    .flex-column { display: flex; flex-direction: column; }
    .align-center { align-items: center; }
    .justify-center { justify-content: center; }
    .mt-auto { margin-top: auto; }
  `]
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
