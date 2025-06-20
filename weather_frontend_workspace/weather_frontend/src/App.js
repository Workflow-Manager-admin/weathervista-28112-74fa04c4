import React from "react";
import "./App.css";
import Header from "./components/Header";
import WeatherDisplay from "./components/WeatherDisplay";
import Forecast from "./components/Forecast";
import Footer from "./components/Footer";
import { useWeatherApi } from "./hooks/useWeatherApi";

function App() {
  const {
    currentWeather,
    forecast,
    loading,
    errors,
    city,
    search
  } = useWeatherApi();

  return (
    <div className="app" style={{ background: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header onSearch={search} />

      <main style={{ flex: "1 0 auto", marginTop: 100, marginBottom: 30 }}>
        <div className="container">
          <WeatherDisplay
            weather={currentWeather}
            city={city}
            isLoading={loading}
            error={errors.current}
          />
          <Forecast
            forecast={forecast}
            isLoading={loading}
            error={errors.forecast}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;