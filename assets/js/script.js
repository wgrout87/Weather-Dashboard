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
var fiveDayForecastEl = document.querySelector("#fiveDayForecast");
// END QUERY SELECTORS



// BEGIN GLOBAL VARIABLES
var searchedCity = null;
var searchBtnPressed = false;
// END GLOBAL VARIABLES



// BEGIN FUNCTION DECLARATIONS
var getCurrentCityWeather = function (city) {
    if (city) {
        fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=792e4643b4781b31d71b6337cd249093&units=imperial")
            .then(function (response) {
                // request was successful
                if (response.ok) {
                    response.json()
                        .then(function (data) {
                            // console.log(data);
                            if (searchBtnPressed == true) {
                                createSearchHistoryBtn(city);
                                searchBtnPressed = false;
                            }
                            updateCurrentCity(city);
                            var lattitude = data.coord.lat;
                            var longitude = data.coord.lon;
                            getWeather(lattitude, longitude);
                            fiveDayForecast(lattitude, longitude);
                        })
                }

                else {
                    alert("City not found")
                    searchBtnPressed = false;
                }
            })
            .catch(function (error) {
                alert("Unable to connect to API");
                searchBtnPressed = false;
            });
    }
    else {
        searchBtnPressed = false;
    }
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
                        // console.log(data);
                        updateCurrentWeather(data);
                    })
            }
        })
};

var fiveDayForecast = function (lat, lon) {
    removeOldForecast();
    fetch("https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=792e4643b4781b31d71b6337cd249093&units=imperial")
        .then(function (response) {
            if (response.ok) {
                response.json()
                    .then(function (data) {
                        console.log(data);
                        for (i = 0; i < data.list.length; i++) {
                            var dateAndTimeArr = data.list[i].dt_txt.split(" ");
                            if (dateAndTimeArr[1] == "12:00:00") {
                                console.log(dateAndTimeArr[0]);
                                futureForecast(data.list[i], dateAndTimeArr[0]);
                            }
                        }
                    })
            }
        })
};

var updateCurrentWeather = function (data) {
    tempEl.textContent = data.current.temp + " °F";
    windEl.textContent = data.current.wind_speed + " MPH";
    humidityEl.textContent = data.current.humidity + "%";
    uvEl.textContent = data.current.uvi;
    assessUvi(data.current.uvi);
};

var assessUvi = function (uvi) {
    uvEl.classList.remove("bg-success", "bg-warning", "bg-danger");
    if (parseInt(uvi) <= 2) {
        uvEl.classList.add("bg-success");
    }

    else if (parseInt(uvi) <= 7) {
        uvEl.classList.add("bg-warning");
    }

    else {
        uvEl.classList.add("bg-danger");
    };
};

var futureForecast = function (arrObj, date) {
    var futureDayEl = document.createElement("div");
    futureDayEl.classList.add("bg-dark", "text-light", "rounded", "col-10", "col-lg-2", "my-4", "mx-auto");
    var futureDateEl = document.createElement("h3");
    futureDateEl.textContent = date;
    futureDayEl.appendChild(futureDateEl);
    var futureTempEl = document.createElement("p");
    futureTempEl.textContent = "Temp: " + arrObj.main.temp;
    futureDayEl.appendChild(futureTempEl);
    var futureWindEl = document.createElement("p");
    futureWindEl.textContent = "Wind: " + arrObj.wind.speed + " MPH";
    futureDayEl.appendChild(futureWindEl);
    futureHumidityEl = document.createElement("p");
    futureHumidityEl.textContent = "Humidity: " + arrObj.main.humidity + "%";
    futureDayEl.appendChild(futureHumidityEl);
    fiveDayForecastEl.appendChild(futureDayEl);
};

var removeOldForecast = function () {
    var child = fiveDayForecastEl.lastElementChild;
    while (child) {
        fiveDayForecastEl.removeChild(child);
        child = fiveDayForecastEl.lastElementChild;
    }
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
            // console.log(searchBtnPressed);
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