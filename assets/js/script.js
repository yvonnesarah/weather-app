let currentTemp = null;

const cities = ["London", "Tokyo", "Paris", "New York", "Dubai", "Sydney", "Berlin"];

// =====================
// WEATHER DISPLAY
// =====================
function refreshWeather(response) {
  document.querySelector("#loader").classList.add("hidden");
  document.querySelector("#error-message").classList.add("hidden");
  document.querySelector("#weather-content").classList.remove("hidden");

  currentTemp = response.data.temperature.current;

  document.querySelector("#city").innerHTML = response.data.city;
  document.querySelector("#country").innerHTML = response.data.country;

  document.querySelector("#description").innerHTML = response.data.condition.description;
  document.querySelector("#humidity").innerHTML = response.data.temperature.humidity + "%";
  document.querySelector("#wind-speed").innerHTML = response.data.wind.speed + " km/h";
  document.querySelector("#feels-like").innerHTML = Math.round(response.data.temperature.feels_like) + "°";

  document.querySelector("#temperature").innerHTML = Math.round(currentTemp);

  document.querySelector("#icon").innerHTML =
    `<img src="${response.data.condition.icon_url}" />`;

  let date = new Date(response.data.time * 1000);
  document.querySelector("#time").innerHTML = formatDate(date);

  document.querySelector("#latitude").innerHTML =
    response.data.coordinates.latitude.toFixed(2);

  document.querySelector("#longitude").innerHTML =
    response.data.coordinates.longitude.toFixed(2);

  // UPDATED TIME FEATURE
  document.querySelector("#updated-time").innerHTML =
    "Updated: " + new Date().toLocaleTimeString();

  getForecast(response.data.city);
}

// =====================
// FORMAT DATE
// =====================
function formatDate(date) {
  let minutes = date.getMinutes();
  if (minutes < 10) minutes = "0" + minutes;

  let days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return `${days[date.getDay()]} ${date.getHours()}:${minutes}`;
}

// =====================
// SEARCH CITY
// =====================
function searchCity(city) {
  document.querySelector("#loader").classList.remove("hidden");
  document.querySelector("#weather-content").classList.add("hidden");
  document.querySelector("#error-message").classList.add("hidden");

  let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=metric`;

  axios.get(apiUrl)
    .then(refreshWeather)
    .catch(() => {
      document.querySelector("#loader").classList.add("hidden");

      // ✅ IMPORTANT: hide old weather data
      document.querySelector("#weather-content").classList.add("hidden");

      // show only error
      document.querySelector("#error-message").classList.remove("hidden");
    });
}

// =====================
// FORM SUBMIT
// =====================
document.querySelector("#search-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    searchCity(document.querySelector("#search-input").value);
  });

// =====================
// FORECAST
// =====================
function getForecast(city) {
  let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
  let apiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=metric`;

  axios.get(apiUrl).then(displayForecast);
}

function displayForecast(response) {
  let forecastHtml = "";

  response.data.daily.forEach((day, index) => {
    if (index < 5) {
      forecastHtml += `
        <div class="forecast-day ${index === 0 ? "today" : ""}">
          <div class="forecast-date">${formatDay(day.time)}</div>
          <img src="${day.condition.icon_url}" class="forecast-icon"/>
          <div class="forecast-temps">
            <div class="max-temp"><strong>${Math.round(day.temperature.maximum)}º</strong></div>
            <div class="min-temp">${Math.round(day.temperature.minimum)}º</div>
          </div>
        </div>`;
    }
  });

  document.querySelector("#forecast").innerHTML = forecastHtml;
}

function formatDay(timestamp) {
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(timestamp * 1000).getDay()];
}

// =====================
// CURRENT LOCATION
// =====================
document.querySelector("#current-location").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition((position) => {
    let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
    let url = `https://api.shecodes.io/weather/v1/current?lat=${position.coords.latitude}&lon=${position.coords.longitude}&key=${apiKey}&units=metric`;

    axios.get(url).then(refreshWeather);
  });
});

// =====================
// DARK MODE
// =====================
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
document.querySelector("#random-city").addEventListener("click", () => {
  let random = cities[Math.floor(Math.random() * cities.length)];
  searchCity(random);
});

// =====================
// UNIT TOGGLE
// =====================
document.querySelector("#fahrenheit").addEventListener("click", () => {
  if (currentTemp === null) return;
  document.querySelector("#temperature").innerHTML =
    Math.round((currentTemp * 9) / 5 + 32);

  document.querySelector("#fahrenheit").classList.add("active-unit");
  document.querySelector("#celsius").classList.remove("active-unit");
});

document.querySelector("#celsius").addEventListener("click", () => {
  if (currentTemp === null) return;
  document.querySelector("#temperature").innerHTML = Math.round(currentTemp);

  document.querySelector("#celsius").classList.add("active-unit");
  document.querySelector("#fahrenheit").classList.remove("active-unit");
});

// =====================
// DEFAULT
// =====================
document.querySelector("#search-input").focus();
searchCity("London");