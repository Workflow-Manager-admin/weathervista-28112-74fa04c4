import React from "react";

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

/**
 * PUBLIC_INTERFACE
 * 7-Day Forecast display.
 * Props:
 *   forecast: { entries: array of {timestamp, temperature, humidity, description, icon}, city }
 *   isLoading: boolean (loading state)
 *   error: string (error to display)
 */
function Forecast({ forecast, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="forecast-block">
        <div className="subtitle" style={{ color: "var(--accent-color)" }}>Loading forecast...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forecast-block">
        <div className="subtitle" style={{ color: "#e53935" }}>{error}</div>
      </div>
    );
  }

  if (!forecast || !forecast.entries || forecast.entries.length === 0) {
    return (
      <div className="forecast-block">
        <div className="subtitle" style={{ color: "var(--text-secondary)" }}>
          Forecast unavailable
        </div>
      </div>
    );
  }

  // Show only distinct days, up to 7:
  // The API may return several 3-hourly points per day; we pick the first per day.
  const daily = [];
  const seenDays = new Set();
  for (const entry of forecast.entries) {
    const day = new Date(entry.timestamp * 1000).toDateString();
    if (!seenDays.has(day) && daily.length < 7) {
      daily.push(entry);
      seenDays.add(day);
    }
  }

  return (
    <div className="forecast-block" style={{ marginTop: 36 }}>
      <div className="subtitle" style={{ color: "var(--secondary-color)", marginBottom: 10 }}>
        7-Day Forecast {forecast.city ? <span>for <b>{forecast.city}</b></span> : null}
      </div>
      <div className="forecast-cards" style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
        {daily.map((entry, ix) => (
          <div
            key={entry.timestamp}
            className="forecast-card"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border-color)",
              borderRadius: 10,
              minWidth: 115,
              padding: 14,
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              marginBottom: 6
            }}
          >
            <div style={{ fontSize: "0.99rem", color: "var(--accent-color)", fontWeight: 500 }}>
              {formatDate(entry.timestamp)}
            </div>
            <img src={`https://openweathermap.org/img/wn/${entry.icon}@2x.png`} alt={entry.description} width={48} style={{ margin: "10px auto" }} />
            <div style={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--primary-color)" }}>
              {Math.round(entry.temperature)}°C
            </div>
            <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>{entry.description}</div>
            <div style={{ fontSize: "0.88rem", color: "var(--secondary-color)" }}>Humidity: {entry.humidity}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Forecast;
