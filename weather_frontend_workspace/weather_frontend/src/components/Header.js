import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Header component for weather app.
 * Shows brand and location search input.
 * Props:
 *   onSearch({ city, lat, lon }):
 *      Triggered with city string, or lat/lon (numbers) for coordinate lookup.
 */
function Header({ onSearch }) {
  const [input, setInput] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [searchMode, setSearchMode] = useState("city"); // "city" or "coord"

  // PUBLIC_INTERFACE
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchMode === "city") {
      const city = input.trim();
      if (city) onSearch({ city });
    } else {
      // Coordinate search
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      if (!isNaN(latNum) && !isNaN(lonNum)) {
        onSearch({ lat: latNum, lon: lonNum });
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: "100%" }}>
        <div className="logo" style={{ color: "var(--primary-color)" }}>
          <span className="logo-symbol" style={{ color: "var(--accent-color)" }}>☀️</span>
          WeatherVista
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", alignItems: "center", gap: 12 }}
          aria-label="location search"
        >
          <select
            value={searchMode}
            onChange={e => setSearchMode(e.target.value)}
            style={{ fontSize: 14, padding: "6px", borderRadius: 4, border: "1px solid var(--border-color)" }}
            aria-label="Search mode"
          >
            <option value="city">City</option>
            <option value="coord">Coordinates</option>
          </select>

          {searchMode === "city" ? (
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter city (e.g., London)"
              aria-label="City"
              style={{
                padding: "8px",
                borderRadius: 4,
                border: "1px solid var(--border-color)",
                width: 160,
                fontSize: 14,
              }}
            />
          ) : (
            <>
              <input
                type="number"
                step="0.01"
                value={lat}
                onChange={e => setLat(e.target.value)}
                placeholder="Lat"
                aria-label="Latitude"
                style={{ padding: "8px", borderRadius: 4, border: "1px solid var(--border-color)", width: 80, fontSize: 14 }}
              />
              <input
                type="number"
                step="0.01"
                value={lon}
                onChange={e => setLon(e.target.value)}
                placeholder="Lon"
                aria-label="Longitude"
                style={{ padding: "8px", borderRadius: 4, border: "1px solid var(--border-color)", width: 80, fontSize: 14 }}
              />
            </>
          )}
          <button className="btn btn-large" type="submit" style={{ background: "var(--primary-color)" }}>
            Search
          </button>
        </form>
      </div>
    </nav>
  );
}

export default Header;
