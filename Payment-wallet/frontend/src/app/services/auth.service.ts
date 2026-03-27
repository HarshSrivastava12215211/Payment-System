import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RegisterRequest, UserDto } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
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
        localStorage.setItem(this.tokenKey, token);
        const email = this.decodeToken(token)?.sub;
        if (email) {
          return this.userService.getUserByEmail(email).pipe(
            tap(user => {
               this.setCurrentUser(user);
               this.loggedIn.next(true);
            }),
            catchError(() => {
               this.loggedIn.next(true); // Still logged in if profile fetch fails
               return of(null as any);
            })
          );
        }
        this.loggedIn.next(true);
        return of(null as any);
      })
    );
  }

  loginWithPassword(identifier: string, password: string): Observable<UserDto> {
    return this.http.post(
      `${this.apiUrl}/auth/login-password?identifier=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`,
      {},
      { responseType: 'text' }
    ).pipe(
      switchMap(token => {
        localStorage.setItem(this.tokenKey, token);
        const email = this.decodeToken(token)?.sub;
        if (email) {
          return this.userService.getUserByEmail(email).pipe(
            tap(user => {
               this.setCurrentUser(user);
               this.loggedIn.next(true);
            }),
            catchError(() => {
               this.loggedIn.next(true);
               return of(null as any);
            })
          );
        }
        this.loggedIn.next(true);
        return of(null as any);
      })
    );
  }

  decodeToken(token: string): any {
    try {
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
}
