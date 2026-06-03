// api/racing.js - Server-side proxy for The Racing API
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const USERNAME = process.env.RACING_API_USERNAME;
  const PASSWORD = process.env.RACING_API_PASSWORD || "";

  if (!USERNAME) {
    return res.status(500).json({ error: "RACING_API_USERNAME not set in Vercel env vars" });
  }

  const { endpoint, params } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: "No endpoint specified" });

  try {
    const auth = Buffer.from(USERNAME + ":" + PASSWORD).toString("base64");
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    const url = "https://api.theracingapi.com/v1/" + endpoint + queryString;

    console.log("Racing API request:", url);

    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + auth,
        "Accept": "application/json",
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Racing API error:", response.status, data);
      return res.status(response.status).json({ error: data.detail || data.message || "Racing API error", status: response.status });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: err.message });
  }
}
