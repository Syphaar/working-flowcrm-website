import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

export async function login(request: Request, response: Response) {
  try {
    const { email, password } = request.body;
    const result = await authService.loginUser(email, password);
    response.json(result);
  } catch (error: any) {
    response.status(401).json({ error: error.message });
  }
}

export async function verifyTwoFactor(request: Request, response: Response) {
  try {
    const { twoFactorToken, otp } = request.body;
    const result = await authService.verifyTwoFactorLogin(twoFactorToken, otp);
    response.json(result);
  } catch (error: any) {
    response.status(401).json({ error: error.message });
  }
}

export async function generate2FA(request: Request, response: Response) {
  try {
    const user = request.user;
    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }
    const result = authService.generate2FASecret(user.userId);
    response.json(result);
  } catch (error: any) {
    response.status(400).json({ error: error.message });
  }
}

export async function enable2FA(request: Request, response: Response) {
  try {
    const user = request.user;
    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }
    const { secret, otp } = request.body;
    const result = await authService.enable2FA(user.userId, secret, otp);
    response.json(result);
  } catch (error: any) {
    response.status(400).json({ error: error.message });
  }
}

export async function disable2FA(request: Request, response: Response) {
  try {
    const user = request.user;
    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }
    const result = await authService.disable2FA(user.userId);
    response.json(result);
  } catch (error: any) {
    response.status(400).json({ error: error.message });
  }
}

export async function register(request: Request, response: Response) {
  try {
    const { name, email, password } = request.body;
    const result = await authService.registerUser(name, email, password);
    response.json(result);
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      response.status(409).json({ error: error.message });
    } else {
      response.status(500).json({ error: error.message });
    }
  }
}

export async function forgotPassword(request: Request, response: Response) {
  try {
    const { email } = request.body;
    const result = await authService.forgotPassword(email);
    response.json(result);
  } catch (error: any) {
    response.json({ ok: true });
  }
}

export async function resetPassword(request: Request, response: Response) {
  try {
    const { token, password } = request.body;
    const result = await authService.resetPassword(token, password);
    response.json(result);
  } catch (error: any) {
    response.status(400).json({ error: error.message });
  }
}

export async function logout(request: Request, response: Response) {
  try {
    const user = request.user;
    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }
    authService.logoutUser(user.userId);
    response.json({ ok: true });
  } catch (error: any) {
    response.status(500).json({ error: error.message });
  }
}

export async function getCurrentUser(request: Request, response: Response) {
  try {
    const user = request.user;
    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }
    const userData = authService.getCurrentUser(user.userId);
    response.json(userData);
  } catch (error: any) {
    response.status(404).json({ error: error.message });
  }
}
