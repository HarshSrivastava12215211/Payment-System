export interface WalletDTO {
  walletId: string;
  userId: number;
  currency: string;
  balance: number;
  frozen: boolean;
}

export interface CreateWalletRequest {
  userId: number;
  initialBalance: number;
  currency: string;
}

export interface WalletOperationRequest {
  userId: number;
  amount: number;
  currency: string;
}

export interface LedgerEntryDTO {
  id: string;
  walletId: string;
  amount: number;
  type: string;
  referenceType: string;
  referenceId: string;
  balanceAfter: number;
  createdAt: string;
}

export interface WalletLimitDTO {
  userId: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
}
