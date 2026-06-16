import { v4 as uuidv4 } from "uuid";
import {
  insert,
  findById,
  removeById,
  getAll,
} from "../config/database.js";

export function generatePasswordResetToken(userId: string): string {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  insert("passwordResetTokens", {
    id: token,
    userId,
    expiresAt,
    used: false,
    createdAt: new Date().toISOString(),
  });

  return token;
}

export function verifyPasswordResetToken(
  token: string
): { userId: string } | null {
  const resetToken = findById<any>("passwordResetTokens", token);

  if (!resetToken) {
    return null;
  }

  if (resetToken.used) {
    return null;
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    return null;
  }

  return { userId: resetToken.userId };
}

export function markResetTokenAsUsed(token: string): void {
  const resetToken = findById<any>("passwordResetTokens", token);
  if (resetToken) {
    insert("passwordResetTokens", { ...resetToken, used: true });
  }
}

export function cleanupExpiredTokens(): void {
  const tokens = getAll<any>("passwordResetTokens");
  const now = new Date();

  for (const token of tokens) {
    if (new Date(token.expiresAt) < now || token.used) {
      removeById("passwordResetTokens", token.id);
    }
  }
}
