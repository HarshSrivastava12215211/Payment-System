export interface NotificationDTO {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface SendNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: string;
}
