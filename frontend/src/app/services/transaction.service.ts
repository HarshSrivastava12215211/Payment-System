import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TransactionDTO, CreateTransactionRequest, UpdateTransactionRequest, DisputeDTO, CreateDisputeRequest, UpdateDisputeRequest } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = `${environment.apiBaseUrl}/api/transaction`;

  constructor(private http: HttpClient) {}

  create(request: CreateTransactionRequest): Observable<TransactionDTO> {
    return this.http.post<TransactionDTO>(this.apiUrl, request);
  }

  getById(id: string): Observable<TransactionDTO> {
    return this.http.get<TransactionDTO>(`${this.apiUrl}/${id}`);
  }

  update(transactionId: string, request: UpdateTransactionRequest): Observable<TransactionDTO> {
    return this.http.put<TransactionDTO>(`${this.apiUrl}/${transactionId}`, request);
  }

  getBySender(senderId: string): Observable<TransactionDTO[]> {
    return this.http.get<TransactionDTO[]>(`${this.apiUrl}/sender/${senderId}`);
  }

  getUserTimeline(userId: number | string): Observable<TransactionDTO[]> {
    const uid = String(userId);
    return this.getAllTransactions().pipe(
      map((txs) =>
        txs
          .filter((t) => String(t.senderId) === uid || String(t.receiverId) === uid)
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.updatedAt || '').getTime() -
              new Date(a.createdAt || a.updatedAt || '').getTime()
          )
      )
    );
  }

  getAllTransactions(): Observable<TransactionDTO[]> {
    return this.http.get<TransactionDTO[]>(this.apiUrl);
  }

  getPendingTransactions(): Observable<TransactionDTO[]> {
    return this.http.get<TransactionDTO[]>(`${this.apiUrl}/pending`);
  }

  getSuspiciousTransactions(): Observable<TransactionDTO[]> {
    return this.http.get<TransactionDTO[]>(`${this.apiUrl}/suspicious`);
  }

  createDispute(request: CreateDisputeRequest): Observable<DisputeDTO> {
    return this.http.post<DisputeDTO>(`${this.apiUrl}/disputes`, request);
  }

  getUserDisputes(userId: number): Observable<DisputeDTO[]> {
    return this.http.get<DisputeDTO[]>(`${this.apiUrl}/disputes/user/${userId}`);
  }

  getAllDisputes(): Observable<DisputeDTO[]> {
    return this.http.get<DisputeDTO[]>(`${this.apiUrl}/disputes`);
  }

  getOpenDisputes(): Observable<DisputeDTO[]> {
    return this.http.get<DisputeDTO[]>(`${this.apiUrl}/disputes/open`);
  }

  updateDispute(id: string, request: UpdateDisputeRequest): Observable<DisputeDTO> {
    return this.http.put<DisputeDTO>(`${this.apiUrl}/disputes/${id}`, request);
  }
}
