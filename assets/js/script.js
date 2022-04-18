// BEGIN QUERY SELECTORS
var searchEl = document.querySelector("#search");
var searchInputEl = document.querySelector("#searchInput");
var searchHistoryEl = document.querySelector("#searchHistory");
var cityEl = document.querySelector("#city");
var currentDateEl = document.querySelector("#currentDate");
var tempEl = document.querySelector("#temp");
var windEl = document.querySelector("#wind");
var humidityEl = document.querySelector("#humidity");
var uvEl = document.querySelector("#uv");
// END QUERY SELECTORS



// BEGIN GLOBAL VARIABLES
var searchedCity = null;
var searchBtnPressed = false;
// END GLOBAL VARIABLES



// BEGIN FUNCTION DECLARATIONS
var getCurrentCityWeather = function (city) {
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=792e4643b4781b31d71b6337cd249093&units=imperial")
        .then(function (response) {
            // request was successful
            if (response.ok) {
                response.json()
                .then(function (data) {
                    console.log(data);
                    if (searchBtnPressed == true) {
                        createSearchHistoryBtn(city);
                        searchBtnPressed = false;
                    }
                    updateCurrentCity(city);
                    var lattitude = data.coord.lat;
                    var longitude = data.coord.lon;
                    getWeather(lattitude, longitude);
                })
            }
        })
};

var updateCurrentCity = function (city) {
    cityEl.textContent = city + " ";
    var currentDate = new Date().toDateString();
    currentDateEl.textContent = "(" + currentDate + ")";
};

var getWeather = function (lat, lon) {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=792e4643b4781b31d71b6337cd249093&units=imperial")
                    .then(function (response) {
                        if (response.ok) {
                            response.json()
                            .then(function (data) {
                                console.log(data);
                                updateCurrentWeather(data);
                                })
                            }
                        })
};

var updateCurrentWeather = function (data) {
    tempEl.textContent = data.current.temp + " °F";
    windEl.textContent = data.current.wind_speed + " MPH";
    humidityEl.textContent = data.current.humidity + "%";
    uvEl.textContent = data.current.uvi;
};

var createSearchHistoryBtn = function (city) {
    var newBtnEl = document.createElement("button");
    newBtnEl.setAttribute("class", "btn btn-secondary btn-block");
    newBtnEl.textContent = city;
    searchHistoryEl.appendChild(newBtnEl);
};

var properCapitalization = function (string) {
    var lowerCaseString = string.toLowerCase();
    var fixedString = lowerCaseString.charAt(0).toUpperCase() + lowerCaseString.slice(1);
    return fixedString;
};

var buttonHandler = function (event) {
    if (event.target.classList.contains("btn")) {
        if (event.target.classList.contains("btn-primary")) {
            searchedCity = properCapitalization(searchInputEl.value);
            searchInputEl.value = "";
            searchBtnPressed = true;
            getCurrentCityWeather(searchedCity);
            console.log(searchBtnPressed);
        };
        if (event.target.classList.contains("btn-secondary")) {
            searchedCity = event.target.textContent;
            getCurrentCityWeather(searchedCity);
        };
    }
};
// END FUNCTION DECLARATIONS



// BEGIN EVENT LISTENERS
searchEl.addEventListener("click", buttonHandler);
// END EVENT LISTENERS