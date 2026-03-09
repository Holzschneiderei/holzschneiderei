import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const attempts = new Map();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

function rateLimit(ip) {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now - record.start > WINDOW_MS) {
    attempts.set(ip, { start: now, count: 1 });
    return true;
  }
  record.count++;
  return record.count <= MAX_ATTEMPTS;
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminPassword || !adminSecret) {
    return res.status(500).json({ error: "Auth not configured" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: "Too many attempts. Try again later." });
  }

  const { password } = req.body || {};
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "Password required" });
  }

  const inputBuf = Buffer.from(password);
  const expectedBuf = Buffer.from(adminPassword);
  if (inputBuf.length !== expectedBuf.length || !timingSafeEqual(inputBuf, expectedBuf)) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const timestamp = Date.now().toString();
  const nonce = randomBytes(16).toString("hex");
  const payload = `${timestamp}:${nonce}`;
  const hmac = createHmac("sha256", adminSecret).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${hmac}`).toString("base64");
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

  return res.status(200).json({ token, expiresAt });
}
