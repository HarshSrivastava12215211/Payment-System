export interface UserDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  isKycApproved: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
}
