export interface AuthenticationPayload {
  userId: string;
  name: string;
  role: string;
}

export interface TokenResponse {
  token: string;
  user: Record<string, any>;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface ResetPasswordRequestBody {
  token: string;
  password: string;
}
