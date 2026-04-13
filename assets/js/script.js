function refreshWeather(response) {
  document.querySelector("#city").innerHTML = response.data.city;
  document.querySelector("#description").innerHTML = response.data.condition.description;
  document.querySelector("#humidity").innerHTML = response.data.temperature.humidity + "%";
  document.querySelector("#wind-speed").innerHTML = response.data.wind.speed + " km/h";
  document.querySelector("#temperature").innerHTML = Math.round(response.data.temperature.current);

  document.querySelector("#icon").innerHTML = `<img src="${response.data.condition.icon_url}" class="forecast-icon" />`;

  let date = new Date(response.data.time * 1000);
  document.querySelector("#time").innerHTML = formatDate(date);

  getForecast(response.data.city);
}

function formatDate(date) {
  let minutes = date.getMinutes();
  if (minutes < 10) minutes = "0" + minutes;
  let days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return `${days[date.getDay()]} ${date.getHours()}:${minutes}`;
}

function searchCity(city) {
  let apiKey = "8bcecf2b930c0252ec9aa584f9do621t";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(refreshWeather);
}

function handleSearchSubmit(event) {
  event.preventDefault();
  searchCity(document.querySelector("#search-input").value);
}

document.querySelector("#search-form").addEventListener("submit", handleSearchSubmit);

function getForecast(city) {
  let apiKey = "8bcecf2b930c0252ec9aa584f9do621t";
  let apiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayForecast);
}

function displayForecast(response) {
  let forecastHtml = "";

  response.data.daily.forEach((day, index) => {
    if (index < 5) {
      forecastHtml += `
        <div class="forecast-day">
          <div class="forecast-date">${formatDay(day.time)}</div>
          <img src="${day.condition.icon_url}" class="forecast-icon" />
          <div class="forecast-temps">
            <strong>${Math.round(day.temperature.maximum)}º</strong><br/>
            ${Math.round(day.temperature.minimum)}º
          </div>
        </div>`;
    }
  });

  document.querySelector("#forecast").innerHTML = forecastHtml;
}

function formatDay(timestamp) {
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(timestamp * 1000).getDay()];
}

searchCity("London");