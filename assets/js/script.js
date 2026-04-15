// =====================
// APP STATE
// =====================

// Stores last searched cities (max 5)
let history = [];

// Stores current temperature (used for unit conversion)
let currentTemp = null;

// Predefined random cities for "Random City" feature
const cities = ["Tokyo", "Paris", "New York", "Dubai", "Sydney", "Berlin"];

// Full dataset of cities with coordinates (used for nearby feature)
const cityCoordinates = [
  // Europe
  { city: "London", lat: 51.5072, lon: -0.1276 },
  { city: "Paris", lat: 48.8566, lon: 2.3522 },
  { city: "Brussels", lat: 50.8503, lon: 4.3517 },
  { city: "Amsterdam", lat: 52.3676, lon: 4.9041 },
  { city: "Berlin", lat: 52.52, lon: 13.405 },
  { city: "Madrid", lat: 40.4168, lon: -3.7038 },
  { city: "Rome", lat: 41.9028, lon: 12.4964 },
  { city: "Vienna", lat: 48.2082, lon: 16.3738 },
  { city: "Prague", lat: 50.0755, lon: 14.4378 },
  { city: "Zurich", lat: 47.3769, lon: 8.5417 },
  { city: "Oslo", lat: 59.9139, lon: 10.7522 },
  { city: "Stockholm", lat: 59.3293, lon: 18.0686 },
  { city: "Dublin", lat: 53.3498, lon: -6.2603 },

  // North America
  { city: "New York", lat: 40.7128, lon: -74.0060 },
  { city: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { city: "Chicago", lat: 41.8781, lon: -87.6298 },
  { city: "Toronto", lat: 43.6532, lon: -79.3832 },
  { city: "Vancouver", lat: 49.2827, lon: -123.1207 },
  { city: "Mexico City", lat: 19.4326, lon: -99.1332 },

  // South America
  { city: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { city: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
  { city: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 },
  { city: "Santiago", lat: -33.4489, lon: -70.6693 },

  // Africa
  { city: "Cairo", lat: 30.0444, lon: 31.2357 },
  { city: "Lagos", lat: 6.5244, lon: 3.3792 },
  { city: "Nairobi", lat: -1.2921, lon: 36.8219 },
  { city: "Cape Town", lat: -33.9249, lon: 18.4241 },

  // Middle East
  { city: "Dubai", lat: 25.2048, lon: 55.2708 },
  { city: "Doha", lat: 25.2854, lon: 51.5310 },
  { city: "Riyadh", lat: 24.7136, lon: 46.6753 },
  { city: "Istanbul", lat: 41.0082, lon: 28.9784 },
  { city: "Tehran", lat: 35.6892, lon: 51.3890 },

  // South Asia
  { city: "Delhi", lat: 28.6139, lon: 77.2090 },
  { city: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { city: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { city: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { city: "Karachi", lat: 24.8607, lon: 67.0011 },
  { city: "Dhaka", lat: 23.8103, lon: 90.4125 },

  // East & Southeast Asia
  { city: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { city: "Seoul", lat: 37.5665, lon: 126.9780 },
  { city: "Beijing", lat: 39.9042, lon: 116.4074 },
  { city: "Shanghai", lat: 31.2304, lon: 121.4737 },
  { city: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  { city: "Singapore", lat: 1.3521, lon: 103.8198 },
  { city: "Bangkok", lat: 13.7563, lon: 100.5018 },
  { city: "Kuala Lumpur", lat: 3.1390, lon: 101.6869 },
  { city: "Jakarta", lat: -6.2088, lon: 106.8456 },
  { city: "Manila", lat: 14.5995, lon: 120.9842 },

  // Oceania
  { city: "Sydney", lat: -33.8688, lon: 151.2093 },
  { city: "Melbourne", lat: -37.8136, lon: 144.9631 },
  { city: "Auckland", lat: -36.8485, lon: 174.7633 }
];

// =====================
// WEATHER DISPLAY
// =====================

// Renders main weather UI from API response
function refreshWeather(response) {
  document.querySelector("#loader").classList.add("hidden");
  document.querySelector("#error-message").classList.add("hidden");
  document.querySelector("#weather-content").classList.remove("hidden");

  currentTemp = response.data.temperature.current;

// City & country
  document.querySelector("#city").innerHTML = response.data.city;
  document.querySelector("#country").innerHTML = response.data.country;

// Weather details
  document.querySelector("#description").innerHTML = response.data.condition.description;
  document.querySelector("#humidity").innerHTML = response.data.temperature.humidity + "%";
  document.querySelector("#wind-speed").innerHTML = response.data.wind.speed + " km/h";
  document.querySelector("#feels-like").innerHTML = Math.round(response.data.temperature.feels_like) + "°";

// Temperature + icon
  document.querySelector("#temperature").innerHTML = Math.round(currentTemp);  
  document.querySelector("#icon").innerHTML =
    `<img src="${response.data.condition.icon_url}" />`;

 // Time formatting
  let date = new Date(response.data.time * 1000);
  document.querySelector("#time").innerHTML = formatDate(date);

// Coordinates display
  document.querySelector("#latitude").innerHTML =
    response.data.coordinates.latitude.toFixed(2);

  document.querySelector("#longitude").innerHTML =
    response.data.coordinates.longitude.toFixed(2);

 // Forecast + nearby cities
  getForecast(response.data.city);
  getNearby(
  response.data.city,
  response.data.coordinates.latitude,
  response.data.coordinates.longitude
);

// AI insight + clothing advice

// AI Assistant
const aiText = generateAIWeatherInsight(response.data);
document.querySelector("#ai-text").innerHTML = aiText;

// Clothing Advice
clothingAdvice(
  response.data.temperature.current,
  response.data.condition.description.toLowerCase()
);

// Live update timestamp
  setInterval(() => {
  document.querySelector("#updated-time").innerHTML =
    "Updated: " + new Date().toLocaleTimeString();
}, 1000);
}

// =====================
// GEO / DISTANCE LOGIC
// =====================

// Calculates distance between two coordinates (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Fetch weather by coordinates (used for nearby clicks + geolocation)
function searchCityByCoords(lat, lon) {
  document.querySelector("#loader").classList.remove("hidden");
  document.querySelector("#weather-content").classList.add("hidden");
  document.querySelector("#error-message").classList.add("hidden");

  let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?lat=${lat}&lon=${lon}&key=${apiKey}&units=metric`;

  axios.get(apiUrl)
    .then((response) => {
      refreshWeather(response);
      addToHistory(response.data.city);
    })
    .catch(() => {
      document.querySelector("#loader").classList.add("hidden");
      document.querySelector("#weather-content").classList.add("hidden");
      document.querySelector("#error-message").classList.remove("hidden");
    });
}


// Finds nearest cities and renders buttons
function getNearby(city, lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") return;

  const currentLat = Number(lat);
  const currentLon = Number(lon);

  const sorted = cityCoordinates
    .filter(c => c.city.toLowerCase() !== city.toLowerCase())
    .map(c => ({
      ...c,
      distance: getDistance(currentLat, currentLon, c.lat, c.lon)
    }))
    .filter(c => !isNaN(c.distance))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);

  const container = document.querySelector("#nearby");

  if (!sorted.length) {
    container.innerHTML = `<p class="details">No nearby cities found.</p>`;
    return;
  }

  container.innerHTML = sorted
  .map(c => `
    <button 
      class="nearby-btn" 
      data-city="${c.city}"
      data-lat="${c.lat}"
      data-lon="${c.lon}"
    >
      <span>📍 ${c.city}</span>
      <small>${Math.round(c.distance)} km</small>
    </button>
  `)
  .join("");

   // Attach click handlers
  container.querySelectorAll(".nearby-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lat = parseFloat(btn.dataset.lat);
      const lon = parseFloat(btn.dataset.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        searchCityByCoords(lat, lon);
      } else {
        searchCity(btn.dataset.city); // fallback
      }
    });
  });
}

// =====================
// DATE FORMATTING
// =====================

// Formats API timestamp into readable string
function formatDate(date) {
  let minutes = date.getMinutes();
  if (minutes < 10) minutes = "0" + minutes;

  let days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return `${days[date.getDay()]} ${date.getHours()}:${minutes}`;
}

// =====================
// SEARCH FUNCTION
// =====================

// Searches weather by city name
function searchCity(city) {
  document.querySelector("#loader").classList.remove("hidden");
  document.querySelector("#weather-content").classList.add("hidden");
  document.querySelector("#error-message").classList.add("hidden");

  let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=metric`;

  axios.get(apiUrl)
  .then((response) => {
    refreshWeather(response);
    addToHistory(city);
  })
    .catch(() => {
      document.querySelector("#loader").classList.add("hidden");

      //  hide old weather data
      document.querySelector("#weather-content").classList.add("hidden");

      // show only error
      document.querySelector("#error-message").classList.remove("hidden");
    });
}

// =====================
// HISTORY SYSTEM
// =====================

// Adds city to recent search history
function addToHistory(city) {
  city = city.trim();

  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    renderHistory();
  }
}

// Renders clickable search history buttons
function renderHistory() {
  const historyDiv = document.querySelector("#history");

  historyDiv.innerHTML = history
    .map(city => `<button class="history-btn">${city}</button>`)
    .join("");

  document.querySelectorAll(".history-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      searchCity(btn.innerText);
    });
  });
}

// =====================
// AI INSIGHT SYSTEM
// =====================

// Generates smart weather-based advice text
function generateAIWeatherInsight(data) {
  const temp = Math.round(data.temperature.current);
  const condition = data.condition.description.toLowerCase();
  const wind = data.wind.speed;
  const humidity = data.temperature.humidity;

  let advice = "";

// Temperature-based advice
  if (temp < 5) {
    advice += "🥶 It's very cold — wear heavy layers, gloves, and stay warm. ";
  } else if (temp < 15) {
    advice += "🧥 It's chilly — a jacket is recommended. ";
  } else if (temp < 25) {
    advice += "😊 Comfortable weather — light clothing is fine. ";
  } else {
    advice += "🔥 It's hot — stay hydrated and wear light clothes. ";
  }

  // Condition-based advice
  if (condition.includes("rain")) {
    advice += "☔ Don't forget an umbrella. ";
  }
  if (condition.includes("snow")) {
    advice += "❄️ Snowy conditions — wear boots and be careful outside. ";
  }
  if (condition.includes("clear")) {
    advice += "☀️ Clear skies — great day to be outside! ";
  }
  if (condition.includes("cloud")) {
    advice += "☁️ A bit cloudy — still okay for plans. ";
  }
  if (condition.includes("storm")) {
    advice += "⛈️ Stormy weather — best to stay indoors. ";
  }

  // Wind logic
  if (wind > 25) {
    advice += "💨 It's quite windy — secure loose items. ";
  }

  // Humidity logic
  if (humidity > 80) {
    advice += "💧 High humidity — it may feel warmer than it is. ";
  }

  return `In ${data.city}, it's ${temp}°C with ${condition}. ${advice}`;
}

// =====================
// CLOTHING ADVICE
// =====================

// Suggests clothing based on temperature + weather
function clothingAdvice(temp, condition) {
  let advice = "";

  if (temp < 5) advice = "🧥 Heavy coat, gloves, scarf";
  else if (temp < 15) advice = "🧥 Jacket or hoodie";
  else if (temp < 25) advice = "👕 T-shirt or light layers";
  else advice = "☀️ Stay cool — light clothes";

  if (condition.includes("rain")) advice += " + ☔ umbrella";
  if (condition.includes("snow")) advice += " + 🥾 boots";

  document.querySelector("#advice").innerHTML = advice;
}

// =====================
// EVENT LISTENERS
// =====================

// Search form submit
document.querySelector("#search-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    searchCity(document.querySelector("#search-input").value);
  });

// =====================
// FORECAST
// =====================

// Forecast fetch
function getForecast(city) {
  let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
  let apiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=metric`;

  axios.get(apiUrl).then(displayForecast);
}

// Forecast rendering
function displayForecast(response) {
  let forecastHtml = "";

  response.data.daily.forEach((day, index) => {
    if (index < 5) {
      forecastHtml += `
        <div class="forecast-day ${index === 0 ? "today" : ""}">
          <div class="forecast-date">${formatDay(day.time)}</div>

          <img src="${day.condition.icon_url}" class="forecast-icon"/>

          <div class="forecast-temps">

            <div class="max-temp">
              <span class="label">MAX</span>
              <strong>${Math.round(day.temperature.maximum)}º</strong>
            </div>

            <div class="min-temp">
              <span class="label">MIN</span>
              ${Math.round(day.temperature.minimum)}º
            </div>

          </div>
        </div>`;
    }
  });

  document.querySelector("#forecast").innerHTML = forecastHtml;
}


// Formats forecast day label
function formatDay(timestamp) {
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(timestamp * 1000).getDay()];
}

// =====================
// CURRENT LOCATION
// =====================

// Uses browser geolocation
document.querySelector("#current-location").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition((position) => {
    let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
    let url = `https://api.shecodes.io/weather/v1/current?lat=${position.coords.latitude}&lon=${position.coords.longitude}&key=${apiKey}&units=metric`;

    axios.get(url).then(refreshWeather);
  });
});


// =====================
// UI FEATURES
// =====================

// Dark Mode Toggle
document.querySelector("#theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const btn = document.querySelector("#theme-toggle");
  btn.innerHTML = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// =====================
// RANDOM CITY
// =====================

// Random city feature
document.querySelector("#random-city").addEventListener("click", () => {
  let random = cities[Math.floor(Math.random() * cities.length)];
  searchCity(random);
});

// =====================
// UNIT TOGGLE
// =====================

// Unit conversion (Fahrenheit)
document.querySelector("#fahrenheit").addEventListener("click", () => {
  if (currentTemp === null) return;
  document.querySelector("#temperature").innerHTML =
    Math.round((currentTemp * 9) / 5 + 32);

  document.querySelector("#fahrenheit").classList.add("active-unit");
  document.querySelector("#celsius").classList.remove("active-unit");
});

// Unit conversion (Celsius)
document.querySelector("#celsius").addEventListener("click", () => {
  if (currentTemp === null) return;
  document.querySelector("#temperature").innerHTML = Math.round(currentTemp);

  document.querySelector("#celsius").classList.add("active-unit");
  document.querySelector("#fahrenheit").classList.remove("active-unit");
});

// =====================
// INITIAL LOAD
// =====================

// Focus input and load default city
document.querySelector("#search-input").focus();
searchCity("London");