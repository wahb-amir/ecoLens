// lib/mail/sendOtpEmail.ts
import nodemailer from "nodemailer";

type SendOtpOpts = {
  expiryMinutes?: number;
  origin?: string;
  maxRetries?: number;
  retryDelayMs?: number;
  verifyPath?: string; 
  verifyQueryParam?: string; 
  verifyUrl?: string; 
  verifyLinkText?: string;
  verifyLogoPath?: string; 
  verifyTimeoutMs?: number;
  sendTimeoutMs?: number;
};

const DEFAULT_OPTS: Required<Pick<
  SendOtpOpts,
  "expiryMinutes" | "maxRetries" | "retryDelayMs" | "verifyPath" | "verifyQueryParam" | "verifyLinkText" | "verifyLogoPath" | "verifyTimeoutMs" | "sendTimeoutMs"
>> = {
  expiryMinutes: 60,
  maxRetries: 3,
  retryDelayMs: 500,
  verifyPath: "/verify-otp",
  verifyQueryParam: "otp",
  verifyLinkText: "Open verification page",
  verifyLogoPath: "/logo.png",
  verifyTimeoutMs: 3000,
  sendTimeoutMs: 10000,
};


let transporter: nodemailer.Transporter | null = null;

function createTransporter(): nodemailer.Transporter {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const secure = process.env.SMTP_SECURE === "true" || (port === 465);

  const service = process.env.EMAIL_SERVICE; // e.g., "gmail"

  if (!user || !pass) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variables for mailer");
  }

  if (!host && !service) {
    throw new Error("Missing SMTP_HOST (preferred) or EMAIL_SERVICE for mailer configuration");
  }

  const transportOptions: any = host
    ? { host, port, secure, auth: { user, pass } }
    : { service, auth: { user, pass } };

  // Pooling can help in production when sending many emails
  transportOptions.pool = process.env.SMTP_POOL === "true" || false;
  transportOptions.maxConnections = process.env.SMTP_MAX_CONNECTIONS ? Number(process.env.SMTP_MAX_CONNECTIONS) : undefined;
  transportOptions.maxMessages = process.env.SMTP_MAX_MESSAGES ? Number(process.env.SMTP_MAX_MESSAGES) : undefined;

  return nodemailer.createTransport(transportOptions);
}

function getTransporter(): nodemailer.Transporter {
  if (!transporter) transporter = createTransporter();
  return transporter;
}

/** small promise timeout helper */
async function pTimeout<T>(promise: Promise<T>, ms: number, errMsg = "Operation timed out"): Promise<T> {
  let timeout: NodeJS.Timeout;
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(errMsg)), ms);
    }),
  ]).finally(() => clearTimeout(timeout));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** sanitize origin: primitive check */
function sanitizeOrigin(o: unknown): string {
  if (!o || typeof o !== "string") return "";
  return o.replace(/\/+$/, "");
}

function buildHtml(otp: string, expiryMinutes: number, verifyUrl: string, logoSrc: string, verifyLinkText: string) {
  const escapedOtp = otp; // OTP is numeric; if you include user values, escape properly
  const logoImg = logoSrc ? `<img src="${logoSrc}" alt="Logo" width="72" style="display:block;margin:0 auto 12px auto;">` : "";
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#f4f6f8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 30px rgba(2,6,23,0.08);">
        <tr><td style="padding:28px 32px;text-align:center;">
          ${logoImg}
          <h1 style="margin:0;font-size:20px;color:#1f7a3a;">Your verification code</h1>
          <p style="color:#495057;margin:8px 0 20px;">Use the code below to verify your account. It expires in <strong>${expiryMinutes} minutes</strong>.</p>
          <div style="display:inline-block;padding:18px 22px;border-radius:10px;background:linear-gradient(180deg,#f7fff9,#effef0);border:1px solid #e6f6ea;">
            <div style="font-family:monospace,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas;font-size:28px;letter-spacing:4px;color:#0f5132;">
              ${escapedOtp}
            </div>
          </div>
          ${verifyUrl ? `<div style="margin-top:18px;"><a href="${verifyUrl}" style="background:#1f7a3a;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600;">${verifyLinkText}</a></div>` : ""}
          <p style="color:#9aa4a8;font-size:13px;margin-top:20px;line-height:1.4;">If you didn't request this, ignore this email. Code expires after ${expiryMinutes} minutes.</p>
          <hr style="border:none;border-top:1px solid #eef2f4;margin:20px 0 12px;">
          <p style="color:#96a0a4;font-size:12px;margin:0;">© ${new Date().getFullYear()} ${process.env.EMAIL_BRAND ?? "Your Company"}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  opts: SendOtpOpts = {}
): Promise<{ success: true; info: nodemailer.SentMessageInfo }> {
  if (!toEmail || typeof toEmail !== "string") throw new TypeError("toEmail is required and must be a string");
  if (!otp || typeof otp !== "string") throw new TypeError("otp is required and must be a string");

  const conf = { ...DEFAULT_OPTS, ...opts };
  const expiryMinutes = Number(conf.expiryMinutes);

  // build verify URL
  const verifyUrl =
    opts.verifyUrl ??
    (sanitizeOrigin(conf.origin ?? process.env.ORIGIN ?? "") || "") // sanitize origin
      ? `${sanitizeOrigin(conf.origin ?? process.env.ORIGIN ?? "")}${conf.verifyPath}?${encodeURIComponent(conf.verifyQueryParam)}=${encodeURIComponent(otp)}`
      : "";

  // From address
  const fromAddress = process.env.EMAIL_FROM ?? `"${process.env.EMAIL_BRAND ?? "App"}" <${process.env.EMAIL_USER}>`;

  const logoSrc = (sanitizeOrigin(conf.origin ?? process.env.ORIGIN ?? "") ? sanitizeOrigin(conf.origin ?? process.env.ORIGIN ?? "") : "") + (conf.verifyLogoPath ?? "");
  const html = buildHtml(otp, expiryMinutes, verifyUrl, logoSrc, conf.verifyLinkText);

  const textParts = [
    `Your verification code is: ${otp}`,
    `It expires in ${expiryMinutes} minutes.`,
    verifyUrl ? `Open: ${verifyUrl}` : "",
  ].filter(Boolean);
  const text = textParts.join("\n\n");

  const mailOptions: nodemailer.SendMailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: process.env.EMAIL_SUBJECT ?? "Your verification code",
    text,
    html,
  };

  const t = getTransporter();

  // Verify transporter (fast-fail if credentials wrong). Use timeout to avoid hanging.
  try {
    await pTimeout(t.verify(), conf.verifyTimeoutMs, "SMTP verify timed out");
  } catch (verifyErr) {
    // In production you'd probably log this to an error tracker
    throw new Error(`SMTP verification failed: ${(verifyErr as Error).message || String(verifyErr)}`);
  }

  // Retries with exponential backoff + jitter
  const maxRetries = Math.max(1, Number(conf.maxRetries));
  const baseDelay = Math.max(100, Number(conf.retryDelayMs));

  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const info = await pTimeout(t.sendMail(mailOptions), conf.sendTimeoutMs, "sendMail timed out");
      return { success: true, info };
    } catch (err) {
      lastErr = err;
      if (attempt >= maxRetries) break;
      const jitter = Math.floor(Math.random() * 100);
      const delay = baseDelay * Math.pow(2, attempt - 1) + jitter;
      // lightweight server log — replace with structured logger in prod
      // Avoid logging full error body in prod to not leak secrets
      // eslint-disable-next-line no-console
      console.warn(`sendOtpEmail attempt ${attempt} failed, retrying in ${delay}ms:`, (err as Error).message ?? err);
      await sleep(delay);
    }
  }

  // All attempts exhausted
  const message = lastErr && (lastErr as any).message ? (lastErr as any).message : String(lastErr);
  throw new Error(`Failed to send OTP email after ${maxRetries} attempts: ${message}`);
}

export default sendOtpEmail;