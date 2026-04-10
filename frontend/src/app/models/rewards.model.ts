export interface RewardPointsDTO {
  id: string;
  userId: number;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  tier: string;
}

export interface PointsTransactionDTO {
  id: string;
  userId: number;
  points: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface RedemptionDTO {
  id: string;
  userId: number;
  catalogItemId: string;
  pointsSpent: number;
  status: string;
  createdAt: string;
}

export interface CatalogItemDTO {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  active: boolean;
  imageUrl: string;
  minTier?: string;
}

export interface RewardRuleDTO {
  id: string;
  name: string;
  description: string;
  pointsPerTransaction: number;
  minTransactionAmount: number;
  active: boolean;
}

export interface CampaignDTO {
  id: string;
  name: string;
  description: string;
  bonusPoints: number;
  triggerType: string;
  startDate: string;
  endDate: string;
  maxRedemptions: number;
  currentRedemptions: number;
  eligibleTier: string;
  isActive: boolean;
}

export interface EarnPointsRequest {
  userId: number;
  transactionId: string;
  amount: number;
}

export interface RedeemRequest {
  userId: number;
  catalogItemId: string;
}
