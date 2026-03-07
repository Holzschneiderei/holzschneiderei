export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const workshopEmail = process.env.WORKSHOP_EMAIL;

  const missing = [];
  if (!apiKey) missing.push('RESEND_API_KEY');
  if (!workshopEmail) missing.push('WORKSHOP_EMAIL');

  if (missing.length > 0) {
    return res.status(200).json({ configured: false, missing });
  }

  // Mask email: first char + *** + @domain
  const [local, domain] = workshopEmail.split('@');
  const masked = local.charAt(0) + '***@' + (domain || '');

  return res.status(200).json({ configured: true, workshopEmail: masked });
}
