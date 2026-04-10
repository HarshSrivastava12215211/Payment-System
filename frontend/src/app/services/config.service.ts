import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: { apiBaseUrl: string } = {
    apiBaseUrl: environment.apiBaseUrl
  };

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    await firstValueFrom(
      this.http.get<{ apiBaseUrl?: string }>('assets/config.json').pipe(
        tap((cfg) => {
          if (cfg && cfg.apiBaseUrl !== undefined) {
            this.config.apiBaseUrl = cfg.apiBaseUrl;
          }
        }),
        catchError((err) => {
          console.warn('ConfigService: runtime config not loaded, using environment fallback', err);
          return of(null);
        })
      )
    );
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }
}
