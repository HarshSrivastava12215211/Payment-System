import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Profile Settings</h1>
      <p>Update your identity, contact information, and account preferences.</p>
    </div>

    <section class="profile-shell glass-card">
      <div class="profile-hero">
        <div class="avatar">{{ initials }}</div>
        <div>
          <h2>{{ form.name || 'PayWallet Member' }}</h2>
          <p>{{ form.email || 'No email available' }}</p>
          <span class="badge badge-info">{{ form.role || 'USER' }}</span>
        </div>
      </div>

      <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
      <div *ngIf="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

      <form class="profile-grid" (ngSubmit)="saveProfile()">
        <div class="form-group">
          <label>Full Name</label>
          <input class="form-control" type="text" name="name" [(ngModel)]="form.name" placeholder="Your full name" />
        </div>

        <div class="form-group">
          <label>Phone Number</label>
          <input class="form-control" type="text" name="phone" [(ngModel)]="form.phone" placeholder="+91 XXXXX XXXXX" />
        </div>

        <div class="form-group full-width">
          <label>Email Address</label>
          <input class="form-control" type="email" name="email" [(ngModel)]="form.email" placeholder="name@example.com" disabled />
        </div>

        <div class="form-group">
          <label>Notification Mode</label>
          <select class="form-control" name="notifyMode" [(ngModel)]="notifyMode">
            <option value="ALL">All Notifications</option>
            <option value="IMPORTANT">Important Only</option>
            <option value="NONE">Mute Alerts</option>
          </select>
        </div>

        <div class="form-group">
          <label>Language</label>
          <select class="form-control" name="language" [(ngModel)]="language">
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>

        <div class="actions full-width">
          <button type="button" class="btn btn-secondary" (click)="resetForm()">Reset</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>

      <p class="note">Profile updates are persisted to your account via User Service.</p>
    </section>
  `,
  styles: [`
    .profile-shell {
      padding: 26px;
      border-radius: 24px;
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(237, 247, 255, 0.92));
    }

    .profile-hero {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border);
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      background: linear-gradient(145deg, #6bb8ff, #2f7ae5);
      color: #fff;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 26px rgba(47, 122, 229, 0.28);
    }

    .profile-hero h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .profile-hero p {
      margin: 4px 0 8px;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    .note {
      margin-top: 16px;
      color: var(--text-muted);
      font-size: 0.82rem;
    }

    @media (max-width: 768px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }

      .actions {
        justify-content: stretch;
      }

      .actions .btn {
        width: 100%;
      }
    }
  `]
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private userService = inject(UserService);

  saving = false;
  successMsg = '';
  errorMsg = '';
  notifyMode = 'ALL';
  language = 'English';

  private user = this.auth.getCurrentUser();

  form = {
    id: this.user?.id ?? 0,
    name: this.user?.name ?? '',
    email: this.user?.email ?? '',
    phone: this.user?.phone ?? '',
    role: this.user?.role ?? 'USER'
  };

  get initials(): string {
    const name = (this.form.name || '').trim();
    if (!name) {
      return 'PW';
    }
    return name
      .split(/\s+/)
      .map((word: string) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  resetForm(): void {
    const current = this.auth.getCurrentUser();
    this.form.name = current?.name ?? '';
    this.form.phone = current?.phone ?? '';
    this.form.email = current?.email ?? '';
    this.form.role = current?.role ?? 'USER';
    this.successMsg = '';
    this.errorMsg = '';
  }

  saveProfile(): void {
    if (!this.form.id) {
      this.errorMsg = 'Unable to identify current user. Please log in again.';
      this.successMsg = '';
      return;
    }

    if (!this.form.name.trim()) {
      this.errorMsg = 'Name is required.';
      this.successMsg = '';
      return;
    }
    if (!this.form.phone.trim()) {
      this.errorMsg = 'Phone number is required.';
      this.successMsg = '';
      return;
    }

    this.saving = true;
    this.errorMsg = '';

    this.userService.updateProfile(this.form.id, {
      name: this.form.name.trim(),
      phone: this.form.phone.trim()
    }).subscribe({
      next: (updatedUser) => {
        this.form.name = updatedUser.name;
        this.form.phone = updatedUser.phone;
        this.form.email = updatedUser.email;
        this.form.role = updatedUser.role;
        this.auth.setCurrentUser(updatedUser);
        this.saving = false;
        this.successMsg = 'Profile changes saved successfully.';
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.error?.message || err?.error || 'Failed to save profile changes.';
        this.successMsg = '';
      }
    });
  }
}
