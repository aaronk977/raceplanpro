import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

var COURSES = {
  "Ireland": {
    "Ballinrobe": [53.6289, -9.2228],
    "Bellewstown": [53.6789, -6.4167],
    "Clonmel": [52.3563, -7.7055],
    "Cork": [51.9169, -8.4625],
    "Curragh": [53.1500, -6.8167],
    "Down Royal": [54.5021, -6.1447],
    "Downpatrick": [54.3294, -5.7094],
    "Dundalk": [53.9831, -6.3831],
    "Fairyhouse": [53.5167, -6.5167],
    "Galway": [53.2744, -8.9897],
    "Gowran Park": [52.6156, -7.0608],
    "Kilbeggan": [53.3667, -7.5167],
    "Killarney": [52.0597, -9.5039],
    "Laytown": [53.6944, -6.2403],
    "Leopardstown": [53.2822, -6.1764],
    "Limerick": [52.5972, -8.7089],
    "Listowel": [52.4539, -9.4803],
    "Naas": [53.2167, -6.6667],
    "Navan": [53.6500, -6.7000],
    "Punchestown": [53.1833, -6.7167],
    "Roscommon": [53.6333, -8.1833],
    "Sligo": [54.2761, -8.4761],
    "Thurles": [52.6833, -7.9000],
    "Tipperary": [52.4833, -8.1667],
    "Tramore": [52.1611, -7.1469],
    "Wexford": [52.3333, -6.4667]
  },
  "UK": {
    "Aintree": [53.4775, -2.9622],
    "Ascot": [51.4083, -0.6681],
    "Ayr": [55.4625, -4.6236],
    "Bangor-on-Dee": [52.9994, -2.9956],
    "Bath": [51.3903, -2.3467],
    "Beverley": [53.8583, -0.4267],
    "Brighton": [50.8303, -0.1347],
    "Carlisle": [54.8839, -2.9614],
    "Cartmel": [54.2028, -2.9267],
    "Catterick": [54.3789, -1.6394],
    "Chelmsford City": [51.7731, 0.5336],
    "Cheltenham": [51.9028, -2.0639],
    "Chepstow": [51.6281, -2.6778],
    "Chester": [53.1731, -2.8908],
    "Doncaster": [53.5211, -1.0986],
    "Epsom": [51.3261, -0.2681],
    "Exeter": [50.7128, -3.4564],
    "Fakenham": [52.8317, 0.8472],
    "Ffos Las": [51.7514, -4.1936],
    "Fontwell": [50.8603, -0.6003],
    "Goodwood": [50.8983, -0.7592],
    "Hamilton": [55.7736, -4.0408],
    "Haydock": [53.4736, -2.6394],
    "Hereford": [52.0736, -2.7028],
    "Hexham": [54.9736, -2.1028],
    "Huntingdon": [52.3406, -0.1781],
    "Kelso": [55.5983, -2.4314],
    "Kempton": [51.4114, -0.3708],
    "Leicester": [52.6297, -1.1042],
    "Lingfield": [51.1783, -0.0003],
    "Ludlow": [52.3706, -2.7183],
    "Market Rasen": [53.3906, -0.3361],
    "Musselburgh": [55.9428, -3.0531],
    "Newbury": [51.3939, -1.3236],
    "Newcastle": [54.9942, -1.6183],
    "Newmarket": [52.2453, 0.4086],
    "Newton Abbot": [50.5314, -3.6033],
    "Nottingham": [52.9481, -1.1367],
    "Perth": [56.3903, -3.4431],
    "Plumpton": [50.9414, -0.0728],
    "Pontefract": [53.6906, -1.3028],
    "Redcar": [54.6178, -1.0681],
    "Ripon": [54.1383, -1.5317],
    "Salisbury": [51.0783, -1.7747],
    "Sandown": [51.3667, -0.3333],
    "Sedgefield": [54.6553, -1.4536],
    "Southwell": [53.0783, -0.9528],
    "Stratford": [52.1853, -1.7053],
    "Taunton": [51.0117, -3.1336],
    "Thirsk": [54.2317, -1.3453],
    "Uttoxeter": [52.9033, -1.8583],
    "Warwick": [52.2878, -1.5742],
    "Wetherby": [53.9281, -1.3836],
    "Wincanton": [51.0567, -2.4097],
    "Windsor": [51.4764, -0.6089],
    "Wolverhampton": [52.5853, -2.0708],
    "Worcester": [52.1836, -2.2453],
    "Yarmouth": [52.6072, 1.7297],
    "York": [53.8989, -1.0453]
  }
};

function haversine(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 1.3); // 1.3 road factor
}

function TravelCost({ settings }) {
  var yardPostcode = (settings && settings.yardPostcode) || "";
  var ratePerKm = parseFloat((settings && settings.costPerKm) || 1.5);
  var currency = (settings && settings.currency) || "EUR";
  var symbol = currency === "GBP" ? "£" : "€";

  var yardCoordsState = useState(null);
  var yardCoords = yardCoordsState[0]; var setYardCoords = yardCoordsState[1];
  var loadingState = useState(false);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var errorState = useState("");
  var error = errorState[0]; var setError = errorState[1];
  var selectedState = useState(null);
  var selected = selectedState[0]; var setSelected = selectedState[1];
  var regionState = useState("Ireland");
  var region = regionState[0]; var setRegion = regionState[1];
  var searchState = useState("");
  var search = searchState[0]; var setSearch = searchState[1];
  var returnTripState = useState(true);
  var returnTrip = returnTripState[0]; var setReturnTrip = returnTripState[1];
  var numHorsesState = useState(1);
  var numHorses = numHorsesState[0]; var setNumHorses = numHorsesState[1];

  useEffect(function() {
    if (!yardPostcode) return;
    setLoading(true); setError(""); setYardCoords(null);
    var query = encodeURIComponent(yardPostcode + ", Ireland");
    fetch("https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=1", {
      headers: { "Accept-Language": "en" }
    }).then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data[0]) {
        setYardCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setError("");
      } else {
        // Try UK
        var q2 = encodeURIComponent(yardPostcode + ", UK");
        return fetch("https://nominatim.openstreetmap.org/search?q=" + q2 + "&format=json&limit=1", {
          headers: { "Accept-Language": "en" }
        }).then(function(r) { return r.json(); }).then(function(d2) {
          if (d2 && d2[0]) {
            setYardCoords([parseFloat(d2[0].lat), parseFloat(d2[0].lon)]);
          } else {
            setError("Could not find postcode. Check Yard Settings → Yard Details.");
          }
        });
      }
    })
    .catch(function() { setError("Location lookup failed. Check internet connection."); })
    .finally(function() { setLoading(false); });
  }, [yardPostcode]);

  var courses = COURSES[region] || {};
  var filtered = Object.keys(courses).filter(function(name) {
    return !search || name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
  }).sort();

  var calcResult = null;
  if (selected && yardCoords && courses[selected]) {
    var coords = courses[selected];
    var km = haversine(yardCoords[0], yardCoords[1], coords[0], coords[1]);
    var totalKm = returnTrip ? km * 2 : km;
    var costPerHorse = Math.round(totalKm * ratePerKm * 100) / 100;
    var totalCost = Math.round(costPerHorse * numHorses * 100) / 100;
    calcResult = { km: km, totalKm: totalKm, costPerHorse: costPerHorse, totalCost: totalCost };
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Travel Cost Calculator</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>
        {"Based on yard postcode: " + (yardPostcode || "not set — add in Yard Settings → Yard Details")}
        {loading && <span style={{ color: C.gold, marginLeft: 8 }}>Looking up location...</span>}
        {error && <span style={{ color: C.red, marginLeft: 8 }}>{error}</span>}
        {yardCoords && !loading && <span style={{ color: C.green, marginLeft: 8 }}>✓ Location found</span>}
      </div>

      {!yardPostcode && (
        <div style={{ background: C.amber + "15", border: "1px solid " + C.amber + "40", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: C.amber }}>
          Add your yard postcode/eircode in <strong>Yard Settings → Yard Details</strong> to use this calculator.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["Ireland", "UK"].map(function(r) {
          return (
            <button key={r} onClick={function() { setRegion(r); setSelected(null); }}
              style={{ padding: "8px 20px", borderRadius: 20, border: "2px solid " + (region === r ? C.navy : C.border),
                background: region === r ? C.navy : "transparent", color: region === r ? "#fff" : C.textMid,
                fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {r === "Ireland" ? "🇮🇪 Ireland" : "🇬🇧 UK"}
            </button>
          );
        })}
        <input value={search} onChange={function(e) { setSearch(e.target.value); setSelected(null); }}
          placeholder="Search course..."
          style={{ flex: 1, minWidth: 140, padding: "8px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 20, fontSize: 13, color: C.text }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, marginBottom: 20 }}>
        {filtered.map(function(name) {
          var isSelected = selected === name;
          var km = yardCoords && courses[name] ? haversine(yardCoords[0], yardCoords[1], courses[name][0], courses[name][1]) : null;
          return (
            <button key={name} onClick={function() { setSelected(name); }}
              style={{ padding: "10px 12px", borderRadius: 10, border: "2px solid " + (isSelected ? C.navy : C.border),
                background: isSelected ? C.navy : C.card, color: isSelected ? "#fff" : C.text,
                cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
              {km && <div style={{ fontSize: 11, color: isSelected ? "rgba(255,255,255,0.6)" : C.textMid, marginTop: 2 }}>{km + " km"}</div>}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ background: C.card, border: "2px solid " + C.navy, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 16 }}>{selected}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase" }}>Trip type</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[true, false].map(function(rt) {
                  return (
                    <button key={rt} onClick={function() { setReturnTrip(rt); }}
                      style={{ flex: 1, padding: "8px", borderRadius: 8, border: "2px solid " + (returnTrip === rt ? C.navy : C.border),
                        background: returnTrip === rt ? C.navy : "transparent", color: returnTrip === rt ? "#fff" : C.textMid,
                        fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      {rt ? "Return" : "One Way"}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase" }}>Horses travelling</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={function() { setNumHorses(function(n) { return Math.max(1, n-1); }); }}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid " + C.border, background: C.cardOff, fontSize: 18, cursor: "pointer", color: C.text }}>-</button>
                <span style={{ fontSize: 18, fontWeight: 800, color: C.text, minWidth: 24, textAlign: "center" }}>{numHorses}</span>
                <button onClick={function() { setNumHorses(function(n) { return n+1; }); }}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid " + C.border, background: C.cardOff, fontSize: 18, cursor: "pointer", color: C.text }}>+</button>
              </div>
            </div>
          </div>

          {calcResult ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                <div style={{ background: C.cardOff, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.textMid, marginBottom: 4, textTransform: "uppercase", fontWeight: 700 }}>Distance</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{calcResult.km + " km"}</div>
                  <div style={{ fontSize: 10, color: C.textMid }}>{returnTrip ? "each way" : "one way"}</div>
                </div>
                <div style={{ background: C.cardOff, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.textMid, marginBottom: 4, textTransform: "uppercase", fontWeight: 700 }}>Total km</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{calcResult.totalKm + " km"}</div>
                  <div style={{ fontSize: 10, color: C.textMid }}>{returnTrip ? "return journey" : "one way"}</div>
                </div>
                <div style={{ background: C.navy, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", fontWeight: 700 }}>Cost per horse</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{symbol + calcResult.costPerHorse.toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{symbol + ratePerKm + "/km"}</div>
                </div>
              </div>
              {numHorses > 1 && (
                <div style={{ background: C.green + "15", border: "1px solid " + C.green + "40", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: C.textMid, marginBottom: 4 }}>{numHorses + " horses × " + symbol + calcResult.costPerHorse.toFixed(2)}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: C.green }}>{symbol + calcResult.totalCost.toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>total travel charge</div>
                </div>
              )}
              <div style={{ fontSize: 11, color: C.textMid, marginTop: 12, textAlign: "center" }}>
                Distance calculated as straight-line × 1.3 road factor. Actual road distance may vary slightly.
              </div>
            </div>
          ) : (
            <div style={{ color: C.textMid, fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              {yardPostcode ? "Looking up yard location..." : "Add yard postcode in Settings to calculate cost."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TravelCost;
