import { Resend } from 'resend';

let _resend: Resend | undefined;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}
