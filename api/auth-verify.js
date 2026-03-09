import { createHmac } from "crypto";

const TTL_MS = 24 * 60 * 60 * 1000;

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return res.status(500).json({ error: "Auth not configured" });
  }

  const { token } = req.body || {};
  if (!token || typeof token !== "string") {
    return res.status(200).json({ valid: false });
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return res.status(200).json({ valid: false });

    const [timestamp, nonce, hmac] = parts;
    const age = Date.now() - parseInt(timestamp, 10);
    if (Number.isNaN(age) || age > TTL_MS || age < 0) {
      return res.status(200).json({ valid: false });
    }

    const expected = createHmac("sha256", adminSecret)
      .update(`${timestamp}:${nonce}`)
      .digest("hex");

    if (hmac !== expected) {
      return res.status(200).json({ valid: false });
    }

    return res.status(200).json({ valid: true });
  } catch {
    return res.status(200).json({ valid: false });
  }
}
