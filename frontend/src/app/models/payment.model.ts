export interface PaymentRequest {
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: string;
  message: string;
  amount: number;
  currency: string;
  senderId: string;
  receiverId: string;
}
