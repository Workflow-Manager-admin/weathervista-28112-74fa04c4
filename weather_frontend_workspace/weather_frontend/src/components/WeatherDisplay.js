import React from "react";

/**
 * PUBLIC_INTERFACE
 * Displays current weather information.
 * Props:
 *   weather: { temperature, humidity, description, icon }
 *   city: City string, if available
 *   isLoading: boolean, shows loading spinner
 *   error: string, optional error message to show
 */
function WeatherDisplay({ weather, city, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="weather-block">
        <div className="subtitle" style={{ color: "var(--accent-color)" }}>Loading current weather...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-block">
        <div className="subtitle" style={{ color: "#e53935" }}>{error}</div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-block">
        <div className="subtitle" style={{ color: "var(--text-secondary)" }}>
          {city ? `No data for ${city}` : "Search for a location"}
        </div>
      </div>
    );
  }

  // OpenWeatherMap icon code: e.g., 10d → https://openweathermap.org/img/wn/{icon}@2x.png
  const iconUrl = weather.icon ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png` : null;

  return (
    <div className="weather-block">
      <div className="subtitle" style={{ color: "var(--secondary-color)", marginBottom: 10 }}>
        Current Weather {city ? <span>in <b>{city}</b></span> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
        {iconUrl && <img src={iconUrl} alt={weather.description} style={{ width: 80, height: 80 }} />}
        <div style={{ flex: 1, minWidth: 150, textAlign: "left" }}>
          <div style={{ fontSize: '2.3rem', fontWeight: 600, color: "var(--primary-color)" }}>
            {Math.round(weather.temperature)}°C
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--text-color)" }}>
            {weather.description}
          </div>
          <div style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
            Humidity: {weather.humidity}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherDisplay;
