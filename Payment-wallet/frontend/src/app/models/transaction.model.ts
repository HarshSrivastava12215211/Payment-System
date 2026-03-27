export interface TransactionDTO {
  transactionId: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  type: string;
  idempotencyKey: string;
}

export interface UpdateTransactionRequest {
  status: string;
}

export interface DisputeDTO {
  id: string;
  transactionId: string;
  userId: number;
  reason: string;
  status: string;
  resolution: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {
  transactionId: string;
  userId: number;
  reason: string;
}

export interface UpdateDisputeRequest {
  status: string;
  resolution: string;
}
