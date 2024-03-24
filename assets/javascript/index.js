$(document).ready(function () {
  const historyContainer = $("#history");
  const searchInput = $("#search-input");
  const searchForm = $("#search-form");
  const todayContainer = $("#today");
  const forecastContainer = $("#forecast");
  const apiKey = "51c50d2dbe7e392d15f06c282b60e834";

  // Make search history buttons clickable
  historyContainer.on("click", ".history-btns", function () {
    const searchValue = $(this).text();
    getWeather(searchValue);
  });

  // search button feature
  searchForm.on("submit", function (event) {
    event.preventDefault();
    const searchValue = searchInput.val().trim();

    // Early return if searchValue is empty
    if (searchValue === "") {
      displayPlaceholder("Please enter a valid city.", 3000);
      return;
    }

    // Capitalize first letter of each word
    const formattedSearchValue = searchValue
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Fetch weather
    getWeather(formattedSearchValue);
    updateSearchHistory(formattedSearchValue);
  });

  function displayPlaceholder(message, duration) {
    searchInput.attr("placeholder", message);
    setTimeout(() => {
      searchInput.attr("placeholder", "Search for a city...");
    }, duration);
  }

  function updateSearchHistory(searchValue) {
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    searchHistory.push(searchValue);

    if (searchHistory.length > 6) {
      searchHistory.shift();
    }
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    updateHistoryDisplay(searchHistory);
  }

  function updateHistoryDisplay(searchHistory) {
    historyContainer.empty();
    searchHistory.slice(-6).forEach((searchValue) => {
      const htmlHist = `
        <div class="d-grid gap-5 mt-3 historyBtns">
          <button class="btn btn-primary history-btns" type="button">${searchValue}</button>
        </div>
      `;
      historyContainer.append(htmlHist);
    });
  }

  // Initially display the history
  updateHistoryDisplay(JSON.parse(localStorage.getItem("searchHistory")) || []);

  // WEATHER API
  function getWeather(searchValue) {
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${searchValue}&appid=${apiKey}&units=metric`;
    fetchWeather(queryURL, (data) => {
      const htmlToday = `
        <div class="card-big">                    
          <h3>${data.name} (${new Date(
        data.dt * 1000
      ).toLocaleDateString()})</h3>
          <img src="https://openweathermap.org/img/w/${
            data.weather[0].icon
          }.png" alt="weather icons">
          <p>Temp: ${Math.round(data.main.temp)}°C</p>
          <p>Wind: ${data.wind.speed} KPH</p>
          <p>Humidity: ${data.main.humidity} %</p>
        </div>
      `;
      todayContainer.html(htmlToday);
      getFiveDays(data.coord.lat, data.coord.lon);
    });
  }

  function getFiveDays(lat, lon) {
    const queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetchWeather(queryURL, (data) => {
      forecastContainer.html("");
      data.list.forEach((element) => {
        if (element.dt_txt.includes("12:00:00")) {
          const htmlStr = `
            <div class="card-item">
              <h3>${new Date(element.dt * 1000).toLocaleDateString()}</h3>
              <img src="https://openweathermap.org/img/w/${
                element.weather[0].icon
              }.png" alt="weather icons">
              <p>Temp: ${Math.round(element.main.temp)} °C</p>
              <p>Wind: ${element.wind.speed} KPH</p>
              <p>Humidity: ${element.main.humidity} %</p>
            </div>
          `;
          forecastContainer.append(htmlStr);
        }
      });
    });
  }

  function fetchWeather(queryURL, callback) {
    fetch(queryURL)
      .then((response) => response.json())
      .then((data) => {
        callback(data);
      })
      .catch((error) => console.error("Error fetching weather data: ", error));
  }
});
