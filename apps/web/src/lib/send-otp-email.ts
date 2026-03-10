/**
 * Sends OTP email. Uses Resend when RESEND_API_KEY is set; otherwise logs (dev).
 * Do not await this in the auth plugin to avoid timing attacks.
 */
const RESEND_API_KEY = typeof process !== 'undefined' ? process.env.RESEND_API_KEY : undefined;
const FROM_EMAIL =
  (typeof process !== 'undefined' ? process.env.FROM_EMAIL : undefined) ?? 'onboarding@resend.dev';

const subjectByType: Record<string, string> = {
  'sign-in': 'Your sign-in code',
  'email-verification': 'Verify your email',
  'forget-password': 'Reset your password',
};

export function sendOTPEmail(params: { email: string; OTP: string; type: string }): void {
  const { email, OTP, type } = params;
  const subject = subjectByType[type] ?? 'Your verification code';

  if (RESEND_API_KEY) {
    void fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject,
        text: `Your code is: ${OTP}. It expires in 5 minutes.`,
      }),
    }).catch((err) => {
      console.error('[sendOTPEmail] Resend failed:', err);
    });
    return;
  }

  // Dev fallback: log only. Do not log in production without a sender.
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.log(`[OTP ${type}] ${email} -> ${OTP}`);
  }
}
