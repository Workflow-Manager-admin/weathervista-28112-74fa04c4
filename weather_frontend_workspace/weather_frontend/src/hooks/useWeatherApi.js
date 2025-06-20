import { useState, useCallback } from "react";

/**
 * PUBLIC_INTERFACE
 * React hook for querying backend weather API.
 * Returns state ({current, forecast, loading, errors, city}) and a search function.
 */
export function useWeatherApi() {
  const [current, setCurrent] = useState(undefined);
  const [forecast, setForecast] = useState(undefined);
  const [city, setCity] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ current: "", forecast: "" });

  const fetchWeather = useCallback(async ({ city, lat, lon }) => {
    setLoading(true);
    setErrors({ current: "", forecast: "" });
    setCurrent(undefined);
    setForecast(undefined);

    let params;
    if (city) {
      params = `city=${encodeURIComponent(city)}`;
      setCity(city);
    } else if (lat != null && lon != null) {
      params = `lat=${lat}&lon=${lon}`;
      setCity(undefined);
    } else {
      setErrors({ current: "Invalid search.", forecast: "" });
      setLoading(false);
      return;
    }

    // Fetch current weather
    let cur;
    try {
      const resp = await fetch(`/weather/current?${params}`);
      if (!resp.ok) throw new Error();
      cur = await resp.json();
      setCurrent(cur);
    } catch {
      setErrors(e => ({ ...e, current: "Could not fetch current weather." }));
    }

    // Fetch forecast
    try {
      const resp = await fetch(`/weather/forecast?${params}`);
      if (!resp.ok) throw new Error();
      const forecastData = await resp.json();
      setForecast(forecastData);
    } catch {
      setErrors(e => ({ ...e, forecast: "Could not fetch forecast." }));
    }

    setLoading(false);
  }, []);

  return {
    currentWeather: current,
    forecast,
    loading,
    errors,
    city,
    search: fetchWeather
  };
}
