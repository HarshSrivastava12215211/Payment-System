import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KycService {
  private apiUrl = `${environment.apiBaseUrl}/kyc`;

  constructor(private http: HttpClient) {}

  submitKyc(userId: string, fullName: string, aadhaar: string, pan: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('fullName', fullName);
    formData.append('aadhaar', aadhaar);
    formData.append('pan', pan);
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/submit`, formData, { responseType: 'text' });
  }

  getAllKycs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }
}
