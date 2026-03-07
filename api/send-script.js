import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scriptContent, orderSummary, customerName, customerEmail, configId } = req.body;

    if (!scriptContent || !configId) {
      return res.status(400).json({ error: 'Missing scriptContent or configId' });
    }

    const workshopEmail = process.env.WORKSHOP_EMAIL;
    const fromEmail = process.env.FROM_EMAIL || 'konfigurator@holzschneiderei.ch';

    if (!workshopEmail) {
      return res.status(500).json({ error: 'WORKSHOP_EMAIL not configured' });
    }

    const filename = `holzschneiderei_${configId}.py`;

    await resend.emails.send({
      from: fromEmail,
      to: workshopEmail,
      subject: `Fusion 360 Script: ${orderSummary || configId}`,
      text: [
        'Neue Bestellung im Konfigurator',
        '',
        `Kunde: ${customerName || 'N/A'}`,
        `E-Mail: ${customerEmail || 'N/A'}`,
        `Konfig-ID: ${configId}`,
        `Zusammenfassung: ${orderSummary || 'N/A'}`,
        '',
        'Das Fusion 360 Python-Script ist als Anhang beigefuegt.',
        'Oeffnen Sie es in Fusion 360 unter Scripts & Add-ins > Run.',
      ].join('\n'),
      attachments: [
        {
          filename,
          content: Buffer.from(scriptContent, 'utf-8'),
        },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('send-script error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
