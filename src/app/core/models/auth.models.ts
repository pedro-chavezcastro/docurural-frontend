import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  expiresAt: number | null;
}
