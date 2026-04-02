import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { retry, tap } from 'rxjs/operators';
import { timer, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { WalletDTO, CreateWalletRequest, WalletOperationRequest, LedgerEntryDTO, WalletLimitDTO } from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = `${environment.apiBaseUrl}/api/wallets`;
  private walletState = new BehaviorSubject<WalletDTO | null>(null);
  wallet$ = this.walletState.asObservable();

  constructor(private http: HttpClient) {}

  createWallet(request: CreateWalletRequest): Observable<WalletDTO> {
    return this.http.post<WalletDTO>(this.apiUrl, request).pipe(
      tap((wallet) => this.storeWallet(wallet))
    );
  }

  getWallet(userId: number): Observable<WalletDTO> {
    return this.http.get<WalletDTO>(`${this.apiUrl}/${userId}`).pipe(
      tap((wallet) => this.storeWallet(wallet)),
      retry({
        count: 3,
        delay: (error, retryCount) => {
          const status = error?.status ?? 0;
          if ([0, 500, 502, 503, 504].includes(status)) {
            return timer(500 * retryCount);
          }
          return throwError(() => error);
        }
      })
    );
  }

  credit(request: WalletOperationRequest): Observable<WalletDTO> {
    return this.http.post<WalletDTO>(`${this.apiUrl}/credit`, request).pipe(
      tap((wallet) => this.storeWallet(wallet))
    );
  }

  debit(request: WalletOperationRequest): Observable<WalletDTO> {
    return this.http.post<WalletDTO>(`${this.apiUrl}/debit`, request).pipe(
      tap((wallet) => this.storeWallet(wallet))
    );
  }

  freezeWallet(userId: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${userId}/freeze`, null, { responseType: 'text' });
  }

  unfreezeWallet(userId: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${userId}/unfreeze`, null, { responseType: 'text' });
  }

  getLedger(userId: number): Observable<LedgerEntryDTO[]> {
    return this.http.get<LedgerEntryDTO[]>(`${this.apiUrl}/${userId}/ledger`).pipe(
      retry({
        count: 2,
        delay: (error, retryCount) => {
          const status = error?.status ?? 0;
          if ([0, 500, 502, 503, 504].includes(status)) {
            return timer(400 * retryCount);
          }
          return throwError(() => error);
        }
      })
    );
  }

  getLedgerByType(userId: number, referenceType: string): Observable<LedgerEntryDTO[]> {
    const params = new HttpParams().set('referenceType', referenceType);
    return this.http.get<LedgerEntryDTO[]>(`${this.apiUrl}/${userId}/ledger/filter`, { params });
  }

  getWalletLimits(userId: number): Observable<WalletLimitDTO> {
    return this.http.get<WalletLimitDTO>(`${this.apiUrl}/${userId}/limits`).pipe(
      retry({
        count: 2,
        delay: (error, retryCount) => {
          const status = error?.status ?? 0;
          if ([0, 500, 502, 503, 504].includes(status)) {
            return timer(400 * retryCount);
          }
          return throwError(() => error);
        }
      })
    );
  }

  exportStatementCsv(userId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${userId}/statement/csv`, { responseType: 'blob' });
  }

  getCachedWallet(userId: number): WalletDTO | null {
    const raw = localStorage.getItem(this.getWalletStorageKey(userId));
    if (!raw) return null;

    try {
      const wallet = JSON.parse(raw) as WalletDTO;
      this.walletState.next(wallet);
      return wallet;
    } catch {
      localStorage.removeItem(this.getWalletStorageKey(userId));
      return null;
    }
  }

  private storeWallet(wallet: WalletDTO): void {
    if (!wallet?.userId) return;
    localStorage.setItem(this.getWalletStorageKey(wallet.userId), JSON.stringify(wallet));
    this.walletState.next(wallet);
  }

  private getWalletStorageKey(userId: number): string {
    return `wallet_cache_${userId}`;
  }
}
