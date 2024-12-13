import axios from "axios";

// API key for accessing the OpenWeatherMap API
const API_KEY = "your_api_key";

// Base URL for fetching current weather data
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

// Base URL for fetching detailed weather data using the One Call API
const ONE_CALL_URL = "https://api.openweathermap.org/data/2.5/onecall";

// Function to fetch weather data for a given city
const fetchWeather = async (city) => {
  try {
    // Fetch current weather data for the specified city
    const weatherResponse = await axios.get(WEATHER_URL, {
      params: {
        q: city, // Name of the city
        units: "metric", // Use metric units (e.g., Celsius)
        appid: API_KEY, // API key for authentication
      },
    });

    // Extract geographic coordinates (latitude and longitude) from the response
    const { coord } = weatherResponse.data;

    // Fetch detailed weather forecast using the coordinates
    const forecastResponse = await axios.get(ONE_CALL_URL, {
      params: {
        lat: coord.lat, // Latitude of the city
        lon: coord.lon, // Longitude of the city
        units: "metric", // Use metric units (e.g., Celsius)
        exclude: "current,minutely,hourly,alerts", // Exclude unnecessary data
        appid: API_KEY, // API key for authentication
      },
    });

    // Return the forecast data
    return forecastResponse.data;
  } catch (error) {
    // Log the error and return null in case of failure
    console.error("Hata:", error);
    return null;
  }
};

// Export the fetchWeather function as the default export
export default fetchWeather;
