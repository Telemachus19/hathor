import nodemailer from 'nodemailer';

export type SendResetEmailOptions = {
  to: string;
  resetUrl: string;
  displayName?: string;
};

export interface EmailService {
  sendPasswordResetEmail(options: SendResetEmailOptions): Promise<void>;
}

export class LogEmailService implements EmailService {
  async sendPasswordResetEmail(options: SendResetEmailOptions): Promise<void> {
    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd) {
      console.log('\n=================== [DEV EMAIL SERVICE] ===================');
      console.log(`To: ${options.to}`);
      console.log(`Subject: Hathor Platform - Password Reset Request`);
      console.log(`Reset URL: ${options.resetUrl}`);
      console.log('===========================================================\n');
    } else {
      // In production, do not log full URLs with tokens to standard log streams
      console.log(`[EmailService] Dispatched password reset email to ${options.to}`);
    }
  }
}

export class SmtpEmailService implements EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor() {
    const host = process.env.SMTP_HOST || 'localhost';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';
    this.from = process.env.SMTP_FROM || 'noreply@hathor.example';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendPasswordResetEmail(options: SendResetEmailOptions): Promise<void> {
    const recipient = options.displayName ? `"${options.displayName}" <${options.to}>` : options.to;
    await this.transporter.sendMail({
      from: this.from,
      to: recipient,
      subject: 'Hathor Platform - Password Reset Request',
      text: `Hello ${options.displayName || 'Gamer'},\n\nYou requested a password reset for your Hathor account. Click the link below to set a new password:\n\n${options.resetUrl}\n\nThis link is valid for 15 minutes. If you did not request this, please ignore this email.\n\nRegards,\nHathor Team`,
      html: `
        <div style="font-family: sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 24px; border-radius: 8px;">
          <h2 style="color: #d97706;">Hathor Gaming Platform</h2>
          <p>Hello ${options.displayName || 'Gamer'},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <p style="margin: 24px 0;">
            <a href="${options.resetUrl}" style="background-color: #d97706; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </p>
          <p style="color: #9ca3af; font-size: 13px;">This link will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  }
}

export function createEmailService(): EmailService {
  const provider = (process.env.EMAIL_PROVIDER || 'log').toLowerCase();
  if (provider === 'smtp') {
    return new SmtpEmailService();
  }
  return new LogEmailService();
}
