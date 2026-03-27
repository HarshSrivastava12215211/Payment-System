import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WalletDTO, CreateWalletRequest, WalletOperationRequest, LedgerEntryDTO, WalletLimitDTO } from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = `${environment.apiBaseUrl}/api/wallets`;

  constructor(private http: HttpClient) {}

  createWallet(request: CreateWalletRequest): Observable<WalletDTO> {
    return this.http.post<WalletDTO>(this.apiUrl, request);
  }

  getWallet(userId: number): Observable<WalletDTO> {
    return this.http.get<WalletDTO>(`${this.apiUrl}/${userId}`);
  }

  credit(request: WalletOperationRequest): Observable<WalletDTO> {
    return this.http.post<WalletDTO>(`${this.apiUrl}/credit`, request);
  }

  debit(request: WalletOperationRequest): Observable<WalletDTO> {
    return this.http.post<WalletDTO>(`${this.apiUrl}/debit`, request);
  }

  freezeWallet(userId: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${userId}/freeze`, null, { responseType: 'text' });
  }

  unfreezeWallet(userId: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${userId}/unfreeze`, null, { responseType: 'text' });
  }

  getLedger(userId: number): Observable<LedgerEntryDTO[]> {
    return this.http.get<LedgerEntryDTO[]>(`${this.apiUrl}/${userId}/ledger`);
  }

  getLedgerByType(userId: number, referenceType: string): Observable<LedgerEntryDTO[]> {
    const params = new HttpParams().set('referenceType', referenceType);
    return this.http.get<LedgerEntryDTO[]>(`${this.apiUrl}/${userId}/ledger/filter`, { params });
  }

  getWalletLimits(userId: number): Observable<WalletLimitDTO> {
    return this.http.get<WalletLimitDTO>(`${this.apiUrl}/${userId}/limits`);
  }

  exportStatementCsv(userId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${userId}/statement/csv`, { responseType: 'blob' });
  }
}
