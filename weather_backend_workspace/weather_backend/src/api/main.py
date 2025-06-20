import os
import time
import httpx
from typing import Optional, Dict, Tuple
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# FastAPI instance with descriptive metadata for Swagger/OpenAPI
app = FastAPI(
    title="WeatherVista Backend API",
    description="Backend service to fetch current and forecast weather data from OpenWeatherMap. Provides REST API endpoints for frontend integration.",
    version="1.0.0",
    openapi_tags=[
        {"name": "Weather", "description": "Operations for current and forecast weather data."},
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY", "your_api_key_here")  # Replace with environment or .env
CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
CACHE_TTL_SECONDS = 300  # Cache results for 5 minutes

CACHE: Dict[Tuple, Tuple[float, dict]] = {}  # (type, params): (timestamp, data)


# Request/Response Models

class WeatherQuery(BaseModel):
    """Request model for weather queries."""
    city: Optional[str] = Field(None, description="City name for weather lookup")
    lat: Optional[float] = Field(None, description="Latitude for weather lookup")
    lon: Optional[float] = Field(None, description="Longitude for weather lookup")

class WeatherData(BaseModel):
    """Response model for current weather data (fragment; keys only for demo)."""
    temperature: float = Field(..., description="Temperature in Celsius.")
    humidity: int = Field(..., description="Humidity percentage.")
    description: str = Field(..., description="Weather condition description.")
    icon: str = Field(..., description="OpenWeatherMap icon code.")

class ForecastEntry(BaseModel):
    timestamp: int = Field(..., description="Forecast data timestamp (UTC, seconds since epoch).")
    temperature: float = Field(..., description="Temperature in Celsius.")
    humidity: int = Field(..., description="Humidity percentage.")
    description: str = Field(..., description="Weather condition description.")
    icon: str = Field(..., description="OpenWeatherMap icon code.")

class ForecastData(BaseModel):
    city: str = Field(..., description="City name corresponding to forecast.")
    entries: list[ForecastEntry] = Field(..., description="List of forecast data points.")

# Helper functions for cache management

def _generate_cache_key(endpoint: str, params: dict) -> Tuple:
    # Cache key as tuple for unique identification
    return (endpoint, tuple(sorted(params.items())))

def _get_cached(endpoint: str, params: dict):
    key = _generate_cache_key(endpoint, params)
    result = CACHE.get(key, None)
    if result is not None:
        timestamp, data = result
        if time.time() - timestamp < CACHE_TTL_SECONDS:
            return data
        del CACHE[key]
    return None

def _set_cache(endpoint: str, params: dict, data: dict):
    key = _generate_cache_key(endpoint, params)
    CACHE[key] = (time.time(), data)

# Helper function for OWM API requests

async def fetch_owm(url: str, params: dict):
    """Make a request to OpenWeatherMap and handle errors."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=10)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Weather API error: {resp.text}")
        return resp.json()


# PUBLIC_INTERFACE
@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"message": "Healthy"}

# PUBLIC_INTERFACE
@app.get("/weather/current", response_model=WeatherData, tags=["Weather"], summary="Get Current Weather", description="Fetch current weather data for a city or coordinate using OpenWeatherMap.")
async def get_current_weather(
    city: Optional[str] = Query(None, description="City name (e.g., London)"),
    lat: Optional[float] = Query(None, description="Latitude (for coordinate-based lookup)"),
    lon: Optional[float] = Query(None, description="Longitude (for coordinate-based lookup)")
):
    """
    Retrieve current weather data for a city name *or* latitude/longitude.
    Requires at least either `city`, or both `lat` and `lon`.
    """
    if not OPENWEATHERMAP_API_KEY or OPENWEATHERMAP_API_KEY == "your_api_key_here":
        raise HTTPException(status_code=500, detail="Weather API key not set.")

    if city:
        owm_params = {"q": city, "appid": OPENWEATHERMAP_API_KEY, "units": "metric"}
    elif lat is not None and lon is not None:
        owm_params = {"lat": lat, "lon": lon, "appid": OPENWEATHERMAP_API_KEY, "units": "metric"}
    else:
        raise HTTPException(status_code=400, detail="Specify either city or lat/lon.")

    cached = _get_cached("current", owm_params)
    if cached:
        owm_json = cached
    else:
        owm_json = await fetch_owm(CURRENT_WEATHER_URL, owm_params)
        _set_cache("current", owm_params, owm_json)

    return WeatherData(
        temperature=owm_json["main"]["temp"],
        humidity=owm_json["main"]["humidity"],
        description=owm_json["weather"][0]["description"],
        icon=owm_json["weather"][0]["icon"],
    )

# PUBLIC_INTERFACE
@app.get("/weather/forecast", response_model=ForecastData, tags=["Weather"], summary="Get Weather Forecast", description="Fetch 5-day/3-hour forecast weather data for a city or coordinate from OpenWeatherMap.")
async def get_forecast_weather(
    city: Optional[str] = Query(None, description="City name (e.g., London)"),
    lat: Optional[float] = Query(None, description="Latitude (for coordinate-based lookup)"),
    lon: Optional[float] = Query(None, description="Longitude (for coordinate-based lookup)")
):
    """
    Retrieve 5-day/3-hour forecast weather data for a city name *or* latitude/longitude.
    Requires at least either `city`, or both `lat` and `lon`.
    """
    if not OPENWEATHERMAP_API_KEY or OPENWEATHERMAP_API_KEY == "your_api_key_here":
        raise HTTPException(status_code=500, detail="Weather API key not set.")

    if city:
        owm_params = {"q": city, "appid": OPENWEATHERMAP_API_KEY, "units": "metric"}
    elif lat is not None and lon is not None:
        owm_params = {"lat": lat, "lon": lon, "appid": OPENWEATHERMAP_API_KEY, "units": "metric"}
    else:
        raise HTTPException(status_code=400, detail="Specify either city or lat/lon.")

    cached = _get_cached("forecast", owm_params)
    if cached:
        owm_json = cached
    else:
        owm_json = await fetch_owm(FORECAST_URL, owm_params)
        _set_cache("forecast", owm_params, owm_json)

    city_name = owm_json.get("city", {}).get("name", city or "")
    entries = [
        ForecastEntry(
            timestamp=entry["dt"],
            temperature=entry["main"]["temp"],
            humidity=entry["main"]["humidity"],
            description=entry["weather"][0]["description"],
            icon=entry["weather"][0]["icon"],
        )
        for entry in owm_json.get("list", [])[:40]  # up to 5-day/3h steps
    ]
    return ForecastData(city=city_name, entries=entries)
