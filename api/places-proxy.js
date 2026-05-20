// api/places-proxy.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  var GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyDsFVrakghiv8sD2Tj-XBXUObKWkL9n0C4";
  var { type, input, placeid } = req.query;

  var fetchUrl;

  if (type === "autocomplete" && input) {
    fetchUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/json" +
      "?input=" + encodeURIComponent(input) +
      "&components=country:ie%7Ccountry:gb" +
      "&language=en" +
      "&types=geocode" +
      "&key=" + GOOGLE_KEY;
  } else if ((type === "details" || placeid) && (req.query.placeid || placeid)) {
    var pid = req.query.placeid || placeid;
    fetchUrl = "https://maps.googleapis.com/maps/api/place/details/json" +
      "?place_id=" + pid +
      "&fields=geometry,formatted_address,address_components" +
      "&key=" + GOOGLE_KEY;
  } else {
    return res.status(400).json({ error: "Invalid request - need type=autocomplete&input= or type=details&placeid=" });
  }

  try {
    var response = await fetch(fetchUrl);
    var data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
