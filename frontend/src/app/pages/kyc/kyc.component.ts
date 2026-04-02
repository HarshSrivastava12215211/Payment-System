import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KycService } from '../../services/kyc.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in" style="max-width: 800px; margin: 0 auto;">
      <div class="glass-card p-4 mb-3" style="border-left: 4px solid var(--primary);">
        <h2 class="font-black text-primary mb-1">🛡️ Identity Verification (KYC)</h2>
        <p class="text-muted" style="font-size: 0.85rem;">Compliance with financial regulations requires a one-time identity check.</p>
      </div>

      <div class="glass-card p-4 fade-in-up" style="animation-delay: 0.1s;">
        <div *ngIf="kycStatus" class="mb-4 text-center">
          <div class="badge w-full p-3 font-bold text-center" style="font-size: 1.1rem; border-radius: var(--radius-sm);" [ngClass]="{'badge-success': kycStatus === 'VERIFIED', 'badge-warning': kycStatus === 'PENDING', 'badge-danger': kycStatus === 'REJECTED'}">
            Current Status: {{ kycStatus }}
          </div>
        </div>

        <div *ngIf="errorMsg" class="badge badge-danger mb-3 w-full p-2 text-center" style="border-radius: var(--radius-sm);">⚠️ {{ errorMsg }}</div>

        <div *ngIf="!submitted && kycStatus !== 'VERIFIED' && kycStatus !== 'PENDING'">
          <div class="dashboard-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label class="font-bold" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Legal Full Name</label>
              <input class="form-control" type="text" [(ngModel)]="fullName" placeholder="As per Govt. ID">
            </div>
            <div class="form-group">
              <label class="font-bold" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Aadhaar Card Number</label>
              <input class="form-control" type="text" [(ngModel)]="aadhaar" placeholder="12-digit UID" maxlength="12">
            </div>
            <div class="form-group">
              <label class="font-bold" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">PAN Card Number</label>
              <input class="form-control" type="text" [(ngModel)]="pan" placeholder="ABCDE1234F" maxlength="10" style="text-transform: uppercase;">
            </div>
            <div class="form-group">
              <label class="font-bold" style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Verification Document</label>
              <div class="upload-zone" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
                <input #fileInput type="file" (change)="onFileSelect($event)" accept=".pdf,.jpg,.jpeg,.png" style="display:none">
                <div class="flex-column align-center gap-1">
                  <span style="font-size: 1.5rem;">📁</span>
                  <p class="font-bold" *ngIf="!selectedFile" style="font-size: 0.7rem;">Click to upload</p>
                  <p class="text-success font-bold" *ngIf="selectedFile" style="font-size: 0.7rem;">✅ {{ selectedFile.name | slice:0:15 }}...</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-3" style="border-top: 1px solid var(--border);">
            <button class="btn btn-primary w-full py-3 font-black" (click)="submitKyc()" [disabled]="loading" style="font-size: 1rem; letter-spacing: 1px;">
              {{ loading ? '⏳ FINALIZING SUBMISSION...' : '✅ SUBMIT FOR VERIFICATION' }}
            </button>
            <p class="text-center text-muted mt-2" style="font-size: 0.7rem;">By submitting, you agree to our verification policy and data privacy terms.</p>
          </div>
        </div>

        <div *ngIf="submitted || kycStatus === 'VERIFIED' || kycStatus === 'PENDING'" class="text-center py-4 fade-in">
          <div class="stat-icon cyan mb-3" style="margin: 0 auto; width: 80px; height: 80px; font-size: 2.5rem;">🎉</div>
          <h2 class="font-black text-primary">Submission Successful!</h2>
          <p class="text-muted mb-4">Your KYC document is {{ kycStatus === 'VERIFIED' ? 'approved' : 'currently under review' }}.</p>
          <button *ngIf="kycStatus === 'REJECTED'" class="btn btn-secondary w-full" (click)="submitted = false; resetForm()">Submit Another Request</button>
        </div>
      </div>
      
      <div class="mt-4 glass-card p-3 flex align-center gap-2" style="background: rgba(255,255,255,0.4);">
        <span style="font-size: 1.2rem;">🛡️</span>
        <p style="font-size: 0.75rem; color: var(--text-muted);">Your data is encrypted with 256-bit AES standard and stored securely in our enterprise vault.</p>
      </div>
    </div>
  `,
  styles: [`
    .upload-zone { border: 2px dashed var(--border); border-radius: var(--radius-md); padding: 15px; text-align: center; cursor: pointer; transition: var(--transition); background: rgba(0,0,0,0.02); }
    .upload-zone:hover { border-color: var(--primary); background: rgba(59, 130, 246, 0.05); }
  `]
})
export class KycComponent {
  private kycService = inject(KycService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  fullName = '';
  aadhaar = '';
  pan = '';
  selectedFile: File | null = null;
  loading = false;
  errorMsg = '';
  successMsg = '';
  submitted = false;
  kycStatus = '';

  ngOnInit() {
    this.checkKycStatus();
  }

  checkKycStatus() {
    const userId = String(this.auth.getCurrentUserId() || 1);
    this.kycService.getKycStatus(userId).subscribe({
      next: (res) => {
        if (res && res.status) {
          this.kycStatus = res.status;
          if (res.status === 'PENDING' || res.status === 'VERIFIED') {
            this.submitted = true;
          }
        }
      },
      error: () => {}
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.selectedFile = input.files[0];
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) this.selectedFile = event.dataTransfer.files[0];
  }

  submitKyc() {
    if (!this.fullName || !this.aadhaar || !this.pan || !this.selectedFile) { this.errorMsg = 'All fields are required'; return; }
    this.loading = true; this.errorMsg = '';
    const userId = String(this.auth.getCurrentUserId() || 1);
    this.kycService.submitKyc(userId, this.fullName, this.aadhaar, this.pan, this.selectedFile).subscribe({
      next: () => { this.submitted = true; this.kycStatus = 'PENDING'; this.loading = false; this.cdr.detectChanges(); },
      error: (e) => { 
        this.errorMsg = 'Error: ' + (e.message || JSON.stringify(e)); 
        this.loading = false; 
        this.cdr.detectChanges(); 
      }
    });
  }

  resetForm() { this.fullName = ''; this.aadhaar = ''; this.pan = ''; this.selectedFile = null; this.errorMsg = ''; this.successMsg = ''; this.kycStatus = ''; }
}
