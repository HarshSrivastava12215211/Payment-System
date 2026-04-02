import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RegisterRequest, UserDto } from '../models/user.model';
import { UserService } from './user.service';
import { WalletService } from './wallet.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private walletService = inject(WalletService);
  private apiUrl = environment.apiBaseUrl;
  private tokenKey = 'jwt_token';
  private userKey = 'current_user';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  register(request: RegisterRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/auth/register`, request, { responseType: 'text' });
  }

  requestOtp(identifier: string): Observable<string> {
    console.log('AuthService: Requesting OTP for', identifier);
    return this.http.post(`${this.apiUrl}/auth/request-otp?identifier=${encodeURIComponent(identifier)}`, {}, { responseType: 'text' }).pipe(
      tap(res => console.log('AuthService: OTP response:', res))
    );
  }

  verifyRegistration(identifier: string, otp: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/auth/verify-registration?identifier=${encodeURIComponent(identifier)}&otp=${encodeURIComponent(otp)}`, {}, { responseType: 'text' });
  }

  login(identifier: string, otp: string): Observable<UserDto> {
    return this.http.post(
      `${this.apiUrl}/auth/Log-In?identifier=${encodeURIComponent(identifier)}&otp=${encodeURIComponent(otp)}`,
      {},
      { responseType: 'text' }
    ).pipe(
      switchMap(token => {
        try {
          localStorage.setItem(this.tokenKey, token);
          const decoded = this.decodeToken(token);
          const email = decoded ? decoded.sub : null;
          
          if (email) {
            return this.userService.getUserByEmail(email).pipe(
              tap(user => {
                 this.setCurrentUser(user);
                 this.primeWallet(user.id);
                 this.loggedIn.next(true);
              }),
              catchError((err) => {
                 console.error('AuthService: Profile fetch failed:', err);
                 this.logout();
                 throw err;
              })
            );
          }
          console.warn('AuthService: Token decoded but no email sub claim found');
          this.loggedIn.next(true);
          return of({ id: 0, email: 'unknown', name: 'User', role: 'USER' } as UserDto);
        } catch (e) {
          console.error('AuthService: Error processing login token:', e);
          throw e; // Throw the error so the component's catch block receives it
        }
      })
    );
  }

  loginWithPassword(identifier: string, password: string): Observable<UserDto> {
    console.log(`AuthService: Initiating login for ${identifier}`);
    return this.http.post(
      `${this.apiUrl}/auth/login-password?identifier=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`,
      {},
      { responseType: 'text' }
    ).pipe(
      switchMap(token => {
        try {
          localStorage.setItem(this.tokenKey, token);
          const decoded = this.decodeToken(token);
          const email = decoded ? decoded.sub : null;
          
          if (email) {
            return this.userService.getUserByEmail(email).pipe(
              tap(user => {
                 this.setCurrentUser(user);
                 this.primeWallet(user.id);
                 this.loggedIn.next(true);
              }),
              catchError((err) => {
                 console.error('AuthService: Profile fetch failed:', err);
                 this.logout();
                 throw err;
              })
            );
          }
          
          console.warn('AuthService: Token decoded but no email sub claim found');
          this.loggedIn.next(true);
          return of({ id: 0, email: 'unknown', name: 'User', role: 'USER' } as UserDto);
        } catch (e) {
          console.error('AuthService: Error processing login token:', e);
          throw e; // Throw the error so the component's catch block receives it
        }
      })
    );
  }

  decodeToken(token: string): any {
    try {
      if (!token || !token.includes('.')) return null;
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
    } catch (e) {
      console.error('AuthService: Token decode error', e);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.loggedIn.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setCurrentUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getCurrentUser(): any {
    const u = localStorage.getItem(this.userKey);
    return u ? JSON.parse(u) : null;
  }

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private primeWallet(userId: number): void {
    this.walletService.getWallet(userId).subscribe({
      next: () => {},
      error: () => {}
    });
  }
}
