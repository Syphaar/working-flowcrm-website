export interface PasswordResetToken {
  id: string;
  userId: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}
