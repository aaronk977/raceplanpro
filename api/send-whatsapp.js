// Vercel serverless function - api/send-whatsapp.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { to, message } = req.body;
  if (!to || !message) return res.status(400).json({ error: "Missing to or message" });

  const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const FROM = process.env.TWILIO_WHATSAPP_FROM;

  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM) {
    return res.status(500).json({ error: "Twilio credentials not configured" });
  }

  // Format number - ensure it has + prefix
  var toFormatted = to.toString().trim();
  if (!toFormatted.startsWith("+")) toFormatted = "+" + toFormatted;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
  const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");

  try {
    const body = new URLSearchParams({
      From: `whatsapp:${FROM}`,
      To: `whatsapp:${toFormatted}`,
      Body: message
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    const data = await response.json();

    if (data.sid) {
      return res.status(200).json({ success: true, sid: data.sid, status: data.status });
    } else {
      return res.status(400).json({ error: data.message || "Twilio error", code: data.code });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
