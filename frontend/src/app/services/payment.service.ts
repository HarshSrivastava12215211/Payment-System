import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentRequest, PaymentResponse } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiBaseUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  makePayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.apiUrl, request).pipe(
      retry({
        count: 2,
        delay: (error, retryCount) => {
          const status = error?.status ?? 0;
          if ([0, 500, 502, 503, 504].includes(status)) {
            return timer(600 * retryCount);
          }
          throw error;
        }
      })
    );
  }

  createRazorpayOrder(amount: number, currency: string, receipt: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/razorpay/create-order`, { amount, currency, receipt });
  }

  processGatewayFallbackTransfer(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/gateway/fallback-transfer`, request).pipe(
      retry({
        count: 1,
        delay: (error) => {
          const status = error?.status ?? 0;
          if ([0, 500, 502, 503, 504].includes(status)) {
            return timer(800);
          }
          throw error;
        }
      })
    );
  }

  verifyRazorpayPayment(payload: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/razorpay/verify`, payload, { responseType: 'text' }).pipe(
      retry({
        count: 1,
        delay: (error) => {
          const status = error?.status ?? 0;
          if ([0, 500, 502, 503, 504].includes(status)) {
            return timer(800);
          }
          throw error;
        }
      })
    );
  }

  getStatus(): Observable<string> {
    return this.http.get(`${this.apiUrl}/status`, { responseType: 'text' });
  }
}
