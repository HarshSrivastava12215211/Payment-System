import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDto } from '../models/user.model';
import { TransactionDTO } from '../models/transaction.model';
import { AdminActionDTO } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiBaseUrl}/admin`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/users`);
  }

  blockUser(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/users/${id}/block`, null, { responseType: 'text' });
  }

  unblockUser(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/users/${id}/unblock`, null, { responseType: 'text' });
  }

  approveKyc(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/users/${id}/kyc/approve`, null, { responseType: 'text' });
  }

  rejectKyc(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/users/${id}/kyc/reject`, null, { responseType: 'text' });
  }

  getAllKycs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/kyc/all`);
  }

  getTransactions(): Observable<TransactionDTO[]> {
    return this.http.get<TransactionDTO[]>(`${this.apiUrl}/transactions`);
  }

  getSuspiciousTransactions(): Observable<TransactionDTO[]> {
    return this.http.get<TransactionDTO[]>(`${this.apiUrl}/transactions/suspicious`);
  }

  createRewardRule(rule: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rules`, rule);
  }

  getActiveRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rules`);
  }

  createCatalogItem(item: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/catalog`, item);
  }

  updateCatalogItem(id: string, item: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/catalog/${id}`, item);
  }

  getAllCatalog(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalog`);
  }

  createCampaign(campaign: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/campaigns`, campaign);
  }

  getAllCampaigns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/campaigns`);
  }

  getDashboardReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/summary`);
  }

  getAuditLog(): Observable<AdminActionDTO[]> {
    return this.http.get<AdminActionDTO[]>(`${this.apiUrl}/audit-log`);
  }
}
