import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const workshopEmail = process.env.WORKSHOP_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'konfigurator@holzschneiderei.ch';

  if (!apiKey || !workshopEmail) {
    return res.status(400).json({ success: false, error: 'Env vars not configured' });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: workshopEmail,
      subject: 'Holzschneiderei Konfigurator – Testmail',
      text: [
        'Dies ist eine Testmail vom Holzschneiderei Konfigurator.',
        '',
        'Wenn Sie diese E-Mail erhalten, ist die Fusion 360 Script-Zustellung korrekt konfiguriert.',
        '',
        `Gesendet: ${new Date().toLocaleString('de-CH')}`,
      ].join('\n'),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('fusion-test error:', err);
    return res.status(200).json({ success: false, error: err.message || 'Email send failed' });
  }
}
