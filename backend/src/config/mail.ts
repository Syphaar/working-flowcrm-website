import nodemailer from "nodemailer";
import { environment } from "./environment.js";

let transporter: nodemailer.Transporter | null = null;

export function getMailTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: environment.mailHost,
      port: environment.mailPort,
      secure: environment.mailSecure,
      auth: {
        user: environment.mailUser,
        pass: environment.mailPassword,
      },
    });
  }
  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const transport = getMailTransporter();
    await transport.sendMail({
      from: environment.mailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
