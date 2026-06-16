import { sendEmail } from "../config/mail.js";

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `http://localhost:5173/auth/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>You have requested to reset your password. Click the button below to set a new password:</p>
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">FlowCRM Enterprise</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your FlowCRM Password",
    html,
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to FlowCRM, ${name}!</h2>
      <p>Your account has been created successfully. You can now log in and start managing your sales pipeline.</p>
      <a href="http://localhost:5173/auth/login" 
         style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Log In
      </a>
      <hr>
      <p style="color: #666; font-size: 12px;">FlowCRM Enterprise</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to FlowCRM",
    html,
  });
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  message: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${subject}</h2>
      <p>${message}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">FlowCRM Enterprise</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}
