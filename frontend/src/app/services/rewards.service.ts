import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RewardPointsDTO, PointsTransactionDTO, RedemptionDTO, CatalogItemDTO, RewardRuleDTO, CampaignDTO, EarnPointsRequest, RedeemRequest } from '../models/rewards.model';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class RewardsService {
  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = `${this.configService.apiBaseUrl}/api/rewards`;
  }

  earnPoints(request: EarnPointsRequest): Observable<RewardPointsDTO> {
    return this.http.post<RewardPointsDTO>(`${this.apiUrl}/earn`, request);
  }

  redeem(request: RedeemRequest): Observable<RedemptionDTO> {
    return this.http.post<RedemptionDTO>(`${this.apiUrl}/redeem`, request);
  }

  getUserPoints(userId: number): Observable<RewardPointsDTO> {
    return this.http.get<RewardPointsDTO>(`${this.apiUrl}/points/${userId}`);
  }

  getPointsHistory(userId: number): Observable<PointsTransactionDTO[]> {
    return this.http.get<PointsTransactionDTO[]>(`${this.apiUrl}/history/${userId}`);
  }

  getUserRedemptions(userId: number): Observable<RedemptionDTO[]> {
    return this.http.get<RedemptionDTO[]>(`${this.apiUrl}/redemptions/${userId}`);
  }

  getActiveCatalog(): Observable<CatalogItemDTO[]> {
    return this.http.get<CatalogItemDTO[]>(`${this.apiUrl}/catalog`);
  }

  getAllCatalog(): Observable<CatalogItemDTO[]> {
    return this.http.get<CatalogItemDTO[]>(`${this.apiUrl}/catalog/all`);
  }

  createCatalogItem(dto: CatalogItemDTO): Observable<CatalogItemDTO> {
    return this.http.post<CatalogItemDTO>(`${this.apiUrl}/catalog`, dto);
  }

  updateCatalogItem(id: string, dto: CatalogItemDTO): Observable<CatalogItemDTO> {
    return this.http.put<CatalogItemDTO>(`${this.apiUrl}/catalog/${id}`, dto);
  }

  getActiveRules(): Observable<RewardRuleDTO[]> {
    return this.http.get<RewardRuleDTO[]>(`${this.apiUrl}/rules`);
  }

  getAllRules(): Observable<RewardRuleDTO[]> {
    return this.http.get<RewardRuleDTO[]>(`${this.apiUrl}/rules/all`);
  }

  createRule(dto: RewardRuleDTO): Observable<RewardRuleDTO> {
    return this.http.post<RewardRuleDTO>(`${this.apiUrl}/rules`, dto);
  }

  getActiveCampaigns(): Observable<CampaignDTO[]> {
    return this.http.get<CampaignDTO[]>(`${this.apiUrl}/campaigns`);
  }

  getAllCampaigns(): Observable<CampaignDTO[]> {
    return this.http.get<CampaignDTO[]>(`${this.apiUrl}/campaigns/all`);
  }

  createCampaign(dto: CampaignDTO): Observable<CampaignDTO> {
    return this.http.post<CampaignDTO>(`${this.apiUrl}/campaigns`, dto);
  }
}
