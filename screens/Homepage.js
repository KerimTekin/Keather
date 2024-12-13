import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Homepage = () => {
  const navigation = useNavigation();

  // State management for weather data, city input, and UI states
  const [weather, setWeather] = useState(null); // Stores the current weather data
  const [loading, setLoading] = useState(true); // Indicates if data is loading
  const [city, setCity] = useState("London"); // Default city
  const [searchQuery, setSearchQuery] = useState(""); // Search query input
  const [isSearchActive, setIsSearchActive] = useState(false); // Toggles search bar visibility
  const [suggestions, setSuggestions] = useState([]); // Stores city search suggestions
  const [dailyForecast, setDailyForecast] = useState([]); // Stores daily weather forecast

  const API_KEY = "your_api_key"; // OpenWeather API Key

  // Weather icon mapping based on condition
  const weatherIcons = {
    Clear: "weather-sunny",
    Clouds: "weather-cloudy",
    Rain: "weather-rainy",
    Snow: "weather-snowy",
    Drizzle: "weather-partly-rainy",
    Thunderstorm: "weather-lightning",
    Mist: "weather-fog",
    Smoke: "weather-fog",
    Haze: "weather-hazy",
    Dust: "weather-hazy",
    Fog: "weather-fog",
    Sand: "weather-hazy",
    Ash: "weather-hazy",
    Squall: "weather-windy",
    Tornado: "weather-tornado",
  };

  // Determines background gradient colors based on weather condition
  const getBackgroundColors = (condition) => {
    switch (condition) {
      case "Clear":
        return ["#FF6700", "#FFA726"];
      case "Clouds":
        return ["#5D6478", "#B4B9CC"];
      case "Rain":
        return ["#2C3138", "#316CF7"];
      case "Snow":
        return ["#688BB8", "#A7E5FF"];
      case "Thunderstorm":
        return ["#0F1824", "#1D2E46"];
      case "Drizzle":
        return ["#2E6CB0", "#324B5A"];
      case "Fog":
      case "Mist":
        return ["#4D5666", "#323A46"];
      default:
        return ["#152B54", "#1E4274"];
    }
  };

  // Saves the selected city to AsyncStorage
  const saveCityToStorage = async (cityName) => {
    try {
      await AsyncStorage.setItem("lastCity", cityName);
    } catch (error) {
      console.error("Error saving city:", error);
    }
  };

  // Loads the last selected city from AsyncStorage
  const loadCityFromStorage = async () => {
    try {
      const savedCity = await AsyncStorage.getItem("lastCity");
      if (savedCity) {
        setCity(savedCity);
      }
    } catch (error) {
      console.error("Error loading city:", error);
    }
  };

  // Fetches current weather data from the API
  const fetchWeatherData = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data.cod !== 200) throw new Error(data.message);
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetches 5-day daily forecast data from the API
  const fetchDailyForecast = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data.cod !== "200") throw new Error(data.message);
      const filteredDailyForecast = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      setDailyForecast(filteredDailyForecast);
    } catch (error) {
      console.error("Error fetching daily forecast:", error);
      setDailyForecast([]);
    }
  };

  // Fetches city suggestions based on user query
  const fetchCitySuggestions = async (query) => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
    }
  };

  // Loads city data from storage on component mount
  useEffect(() => {
    loadCityFromStorage();
  }, []);

  // Fetches weather data and forecast when city changes
  useEffect(() => {
    fetchWeatherData();
    fetchDailyForecast();
  }, [city]);

  // Handles search input and fetches suggestions
  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchCitySuggestions(query);
  };

  // Selects a city from suggestions
  const selectCity = (selectedCity) => {
    setCity(selectedCity);
    saveCityToStorage(selectedCity);
    setLoading(true);
    setSearchQuery("");
    setSuggestions([]);
    setIsSearchActive(false);
  };

  // Displays loading state
  if (loading) {
    return (
      <LinearGradient colors={["#1E3C72", "#2A5298"]} style={styles.container}>
        <Text style={styles.loadingText}>Loading data...</Text>
      </LinearGradient>
    );
  }

  // Displays error state if weather data is unavailable
  if (!weather) {
    return (
      <LinearGradient colors={["#1E3C72", "#2A5298"]} style={styles.container}>
        <Text style={styles.errorText}>Unable to fetch weather data.</Text>
      </LinearGradient>
    );
  }

  // Extracts weather condition and associated icon
  const weatherCondition = weather.weather[0].main;
  const weatherIcon = weatherIcons[weatherCondition] || "weather-cloudy";

  // Gets background colors based on weather condition
  const backgroundColors = getBackgroundColors(weather.weather[0].main);

  return (
    <LinearGradient colors={backgroundColors} style={styles.container}>
      {/* Header Section with Title and Search */}
      <View style={styles.header}>
        <Text style={styles.title}>KEATHER</Text>
        <View style={styles.searchContainer}>
          {isSearchActive ? (
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search city"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => setIsSearchActive(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsSearchActive(true)}>
              <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => `${item.lat}-${item.lon}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => selectCity(item.name)}
            >
              <Text style={styles.suggestionText}>
                {item.name}, {item.country}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Main Weather Information */}
      <View style={styles.mainWeather}>
        <Text style={styles.weatherplaces}>
          {weather.name && weather.sys
            ? `${weather.name}, ${weather.sys.country}`
            : "Unknown Location"}
        </Text>
        <MaterialCommunityIcons name={weatherIcon} size={200} color="#fff" />
        <Text style={styles.temperature}>{Math.round(weather.main.temp)}°</Text>
        <Text style={styles.weatherDescription}>
          {weather.weather[0].description}
        </Text>
      </View>

      {/* Additional Weather Info */}
      <View style={styles.additionalInfo}>
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="weather-windy" size={24} color="#fff" />
          <Text style={styles.infoText}>
            {weather.wind.speed.toFixed(1)} km/h
          </Text>
        </View>
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="water" size={24} color="#fff" />
          <Text style={styles.infoText}>{weather.main.humidity}%</Text>
        </View>
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="weather-sunset-up"
            size={24}
            color="#fff"
          />
          <Text style={styles.infoText}>
            {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
          </Text>
        </View>
      </View>

      {/* Horizontal Daily Forecast */}
      <ScrollView horizontal style={styles.forecast}>
        {dailyForecast.map((forecast, index) => {
          const forecastIcon =
            weatherIcons[forecast.weather[0].main] || "weather-cloudy";
          const dayName = new Date(forecast.dt * 1000).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          );
          return (
            <View key={index} style={styles.forecastItem}>
              <MaterialCommunityIcons
                name={forecastIcon}
                size={24}
                color="#fff"
              />
              <Text style={styles.forecastDay}>{dayName}</Text>
              <Text style={styles.forecastTemp}>
                {Math.round(forecast.main.temp)}°
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  // menuIcon: {
  //   fontSize: 24,
  //   color: "#fff",
  // },
  title: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 10,
    width: "80%",
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  suggestionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  closeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    zIndex: 1,
    backgroundColor: "#ff4d4d",
    borderRadius: 15,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonIcon: {
    color: "#fff",
    fontSize: 16,
  },

  mainWeather: {
    alignItems: "center",
    marginVertical: 10,
  },
  weatherplaces: {
    fontSize: 20,
    color: "#fff",
    marginTop: 10,
    marginBottom: 20,
  },
  temperature: {
    fontSize: 64,
    color: "#fff",
    fontWeight: "bold",
  },
  weatherDescription: {
    fontSize: 20,
    color: "#fff",
    marginTop: 15,
    marginBottom: 10,
  },
  additionalInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  infoBox: {
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
  forecast: {
    paddingHorizontal: 10,
    paddingVertical: 75,
  },
  forecastItem: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  forecastDay: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
  },
});

export default Homepage;
