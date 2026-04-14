let currentTemp = null;

// Refresh UI (SUCCESS)
function refreshWeather(response) {
  document.querySelector("#error-message").classList.add("hidden");
  document.querySelector("#weather-content").classList.remove("hidden");

  currentTemp = response.data.temperature.current;

  document.querySelector("#city").innerHTML = response.data.city;
  document.querySelector("#description").innerHTML = response.data.condition.description;
  document.querySelector("#humidity").innerHTML = response.data.temperature.humidity + "%";
  document.querySelector("#wind-speed").innerHTML = response.data.wind.speed + " km/h";
  document.querySelector("#temperature").innerHTML = Math.round(currentTemp);

  document.querySelector("#icon").innerHTML =
    `<img src="${response.data.condition.icon_url}" />`;

  let date = new Date(response.data.time * 1000);
  document.querySelector("#time").innerHTML = formatDate(date);

  getForecast(response.data.city);
}

// Format date
function formatDate(date) {
  let minutes = date.getMinutes();
  if (minutes < 10) minutes = "0" + minutes;

  let days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return `${days[date.getDay()]} ${date.getHours()}:${minutes}`;
}

// Search city
function searchCity(city) {
  document.querySelector("#city").innerHTML = "Loading...";
  document.querySelector("#temperature").innerHTML = "...";
  document.querySelector("#description").innerHTML = "Fetching weather...";
  document.querySelector("#icon").innerHTML = "⏳";

  let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=metric`;

  axios.get(apiUrl)
    .then(refreshWeather)
    .catch(() => {
      document.querySelector("#error-message").classList.remove("hidden");
      document.querySelector("#weather-content").classList.add("hidden");

      currentTemp = null;
    });
}

// Handle search
function handleSearchSubmit(event) {
  event.preventDefault();
  let city = document.querySelector("#search-input").value;
  searchCity(city);
}

document.querySelector("#search-form")
  .addEventListener("submit", handleSearchSubmit);

// Forecast
function getForecast(city) {
  let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
  let apiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=metric`;

  axios.get(apiUrl).then(displayForecast);
}

// Display forecast
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
              <span>${Math.round(day.temperature.minimum)}º</span>
            </div>
          </div>
        </div>`;
    }
  });

  document.querySelector("#forecast").innerHTML = forecastHtml;
}

// Format day
function formatDay(timestamp) {
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(timestamp * 1000).getDay()];
}

// Current location
document.querySelector("#current-location").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition((position) => {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    let apiKey = "8bcecf3b930c0252ec9aa584f9do621t";
    let apiUrl = `https://api.shecodes.io/weather/v1/current?lon=${lon}&lat=${lat}&key=${apiKey}&units=metric`;

    axios.get(apiUrl).then(refreshWeather);
  });
});

// Unit toggle
document.querySelector("#fahrenheit").addEventListener("click", () => {
  if (currentTemp === null) return;

  let fahrenheit = (currentTemp * 9) / 5 + 32;
  document.querySelector("#temperature").innerHTML = Math.round(fahrenheit);

  document.querySelector("#fahrenheit").classList.add("active-unit");
  document.querySelector("#celsius").classList.remove("active-unit");
});

document.querySelector("#celsius").addEventListener("click", () => {
  if (currentTemp === null) return;

  document.querySelector("#temperature").innerHTML = Math.round(currentTemp);

  document.querySelector("#celsius").classList.add("active-unit");
  document.querySelector("#fahrenheit").classList.remove("active-unit");
});

// Autofocus input
document.querySelector("#search-input").focus();

// Default city
searchCity("London");