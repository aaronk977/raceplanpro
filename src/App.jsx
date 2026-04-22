import { useState, useEffect } from "react";

const INITIAL_HORSES = [
  { id: "1", name: "Horse One" },
  { id: "2", name: "Horse Two" }
];

export default function App() {
  const [horses, setHorses] = useState(() => {
    const saved = localStorage.getItem("rpp_horses");
    return saved ? JSON.parse(saved) : INITIAL_HORSES;
  });

  const [medLogs, setMedLogs] = useState(() => {
    const saved = localStorage.getItem("rpp_medlogs");
    return saved ? JSON.parse(saved) : {};
  });

  const [medications, setMedications] = useState([
    { name: "Peptizole", price: 5 },
    { name: "Antepsin", price: 4 },
    { name: "Antibiotics", price: 10 }
  ]);

  useEffect(() => {
    localStorage.setItem("rpp_horses", JSON.stringify(horses));
  }, [horses]);

  useEffect(() => {
    localStorage.setItem("rpp_medlogs", JSON.stringify(medLogs));
  }, [medLogs]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const toggleMed = (horseId, medName, day) => {
    const dateKey = `2026-04-${String(day).padStart(2, "0")}`;

    setMedLogs((prev) => {
      const updated = { ...prev };

      if (!updated[horseId]) updated[horseId] = {};
      if (!updated[horseId][medName]) updated[horseId][medName] = {};

      updated[horseId][medName][dateKey] =
        !updated[horseId][medName][dateKey];

      return updated;
    });
  };

  const getTodaySummary = () => {
    const today = new Date().toISOString().slice(0, 10);
    const summary = [];

    Object.entries(medLogs).forEach(([horseId, meds]) => {
      const horse = horses.find((h) => h.id === horseId);

      Object.entries(meds).forEach(([medName, dates]) => {
        if (dates[today]) {
          summary.push({
            horse: horse?.name,
            medication: medName
          });
        }
      });
    });

    return summary;
  };

  const todaySummary = getTodaySummary();

  return (
    <div style={{ padding: 20 }}>
      <h1>RacePlan Pro</h1>

      <div style={{ marginBottom: 30 }}>
        <h2>Today’s Medications</h2>
        {todaySummary.length === 0 ? (
          <p>No meds today</p>
        ) : (
          <ul>
            {todaySummary.map((s, i) => (
              <li key={i}>
                <strong>{s.horse}</strong> → {s.medication}
              </li>
            ))}
          </ul>
        )}
      </div>

      {horses.map((horse) => (
        <div key={horse.id} style={{ marginBottom: 40 }}>
          <h2>{horse.name}</h2>

          {medications.map((med) => (
            <div key={med.name} style={{ marginBottom: 10 }}>
              <strong>{med.name} (€{med.price})</strong>

              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {days.map((day) => {
                  const dateKey = `2026-04-${String(day).padStart(2, "0")}`;
                  const checked =
                    medLogs[horse.id]?.[med.name]?.[dateKey] || false;

                  return (
                    <label key={day} style={{ marginRight: 6 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggleMed(horse.id, med.name, day)
                        }
                      />
                      {day}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
