import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KycService } from '../../services/kyc.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>🆔 KYC Verification</h1>
      <p>Submit your identity documents for verification</p>
    </div>

    <div style="max-width: 600px;">
      <div class="glass-card" style="padding: 36px; animation: fadeInUp 0.5s ease-out;">
        <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
        <div *ngIf="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

        <div *ngIf="!submitted">
          <div class="form-group">
            <label>Full Name</label>
            <input class="form-control" type="text" [(ngModel)]="fullName" placeholder="As per government ID">
          </div>
          <div class="form-group">
            <label>Aadhaar Number</label>
            <input class="form-control" type="text" [(ngModel)]="aadhaar" placeholder="XXXX XXXX XXXX" maxlength="12">
          </div>
          <div class="form-group">
            <label>PAN Number</label>
            <input class="form-control" type="text" [(ngModel)]="pan" placeholder="ABCDE1234F" maxlength="10" style="text-transform: uppercase;">
          </div>
          <div class="form-group">
            <label>Identity Document</label>
            <div class="file-upload" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
              <input #fileInput type="file" (change)="onFileSelect($event)" accept=".pdf,.jpg,.jpeg,.png" style="display:none">
              <div class="file-upload-content">
                <span style="font-size: 2rem; animation: float 3s ease-in-out infinite;">📎</span>
                <p *ngIf="!selectedFile">Click or drag to upload your document</p>
                <p *ngIf="selectedFile" style="color: var(--success); font-weight: 600;">✅ {{ selectedFile.name }}</p>
                <span style="font-size: 0.78rem; color: var(--text-muted);">PDF, JPG, PNG accepted</span>
              </div>
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%;" (click)="submitKyc()" [disabled]="loading">
            {{ loading ? '⏳ Submitting...' : '📤 Submit KYC' }}
          </button>
        </div>

        <div *ngIf="submitted" style="text-align: center; padding: 30px 0; animation: scaleIn 0.4s ease-out;">
          <div style="font-size: 4rem; margin-bottom: 16px; animation: float 2s ease-in-out infinite;">🎉</div>
          <h2 style="font-weight: 700; margin-bottom: 8px;">KYC Submitted!</h2>
          <p style="color: var(--text-secondary);">Your documents are under review.</p>
          <button class="btn btn-secondary mt-3" (click)="submitted = false; resetForm()">Submit Another</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .file-upload { border: 2px dashed var(--border); border-radius: var(--radius-md); padding: 30px; text-align: center; cursor: pointer; transition: var(--transition); background: var(--bg-glass); }
    .file-upload:hover { border-color: var(--primary); background: rgba(59, 130, 246, 0.04); }
    .file-upload-content { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  `]
})
export class KycComponent {
  private kycService = inject(KycService);
  private auth = inject(AuthService);

  fullName = '';
  aadhaar = '';
  pan = '';
  selectedFile: File | null = null;
  loading = false;
  errorMsg = '';
  successMsg = '';
  submitted = false;

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
      next: () => { this.submitted = true; this.loading = false; },
      error: (e) => { this.errorMsg = e.error || 'KYC submission failed'; this.loading = false; }
    });
  }

  resetForm() { this.fullName = ''; this.aadhaar = ''; this.pan = ''; this.selectedFile = null; this.errorMsg = ''; this.successMsg = ''; }
}
