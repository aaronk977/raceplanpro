// api/places-proxy.js - proxies Google Places API calls server-side
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  var { url, placeid, key } = req.query;
  var apiKey = key || process.env.GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) return res.status(400).json({ error: "No API key" });

  var fetchUrl;
  if (placeid) {
    fetchUrl = "https://maps.googleapis.com/maps/api/place/details/json?place_id=" + placeid + "&fields=geometry,formatted_address&key=" + apiKey;
  } else if (url) {
    // Autocomplete request - replace key in URL
    fetchUrl = decodeURIComponent(url).replace(/key=[^&]+/, "key=" + apiKey);
  } else {
    return res.status(400).json({ error: "Missing url or placeid" });
  }

  try {
    var response = await fetch(fetchUrl);
    var data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
