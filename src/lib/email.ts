// Email sending via Brevo (HTTP API — works on serverless / Vercel).
const BREVO_API_KEY = process.env.BREVO_API_KEY as string;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL as string;
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "Form Builder";

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Email send failed: ${detail}`);
  }
}

export async function sendVerificationEmail(to: string, code: string) {
  await sendEmail(
    to,
    "Verify your email — Form Builder",
    `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2>Verify your email</h2>
        <p>Use this code to verify your Form Builder account:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px">${code}</p>
        <p style="color:#666">This code expires in 15 minutes.</p>
      </div>
    `
  );
}

export async function sendResetEmail(to: string, link: string) {
  await sendEmail(
    to,
    "Reset your password — Form Builder",
    `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2>Reset your password</h2>
        <p>Click the button below to set a new password:</p>
        <p>
          <a href="${link}"
             style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">
            Reset Password
          </a>
        </p>
        <p style="color:#666">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `
  );
}

// 6-digit numeric code
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
