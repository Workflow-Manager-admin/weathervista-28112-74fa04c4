import React from "react";

/**
 * PUBLIC_INTERFACE
 * Simple footer with app and data attribution.
 */
function Footer() {
  return (
    <footer className="footer" style={{
      marginTop: "auto",
      background: "var(--background)",
      borderTop: "1px solid var(--border-color)",
      color: "var(--text-secondary)",
      padding: 18,
      textAlign: "center",
      fontSize: "1rem"
    }}>
      Weather data via <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-color)", textDecoration: "none" }}>OpenWeatherMap</a>.
      <div style={{ marginTop: 2, fontSize: "0.97em" }}>
        &copy; {new Date().getFullYear()} WeatherVista &ndash; Modern Weather App
      </div>
    </footer>
  );
}

export default Footer;
