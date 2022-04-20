// BEGIN QUERY SELECTORS
var searchEl = document.querySelector("#search");
var searchInputEl = document.querySelector("#searchInput");
var searchHistoryEl = document.querySelector("#searchHistory");
var cityEl = document.querySelector("#city");
var iconEl = document.querySelector("#icon");
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
var monthsArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var searchHistoryArr = [];
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
                                if (!searchHistoryArr.includes(city)) {
                                    searchHistoryArr.unshift(city);
                                    console.log(searchHistoryArr);
                                    createSearchHistoryBtns();
                                };
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
                        console.log(data);
                        updateCurrentWeather(data);
                        var iconSrc = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png";
                        iconEl.setAttribute("src", iconSrc);
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
                        // console.log(data);
                        for (i = 0; i < data.list.length; i++) {
                            var dateAndTimeArr = data.list[i].dt_txt.split(" ");
                            if (dateAndTimeArr[1] == "00:00:00") {
                                // console.log(dateAndTimeArr[0]);
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
    var futureDateEl = document.createElement("h4");
    futureDateEl.textContent = convertDate(date);
    futureDayEl.appendChild(futureDateEl);
    var futureIcon = document.createElement("img");
    var iconSrc = "http://openweathermap.org/img/wn/" + arrObj.weather[0].icon + "@2x.png";
    futureIcon.setAttribute("src", iconSrc);
    futureDayEl.appendChild(futureIcon);
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

var createSearchHistoryBtns = function () {
    removeOldSearchBtns();
    for (i = 0; i < searchHistoryArr.length; i++) {
        var newBtnEl = document.createElement("button");
        newBtnEl.setAttribute("class", "btn btn-secondary btn-block");
        newBtnEl.textContent = searchHistoryArr[i];
        searchHistoryEl.appendChild(newBtnEl);
        if (searchHistoryArr.length == 11) {
            searchHistoryArr.pop();
        };
    };
    localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
};

var properCapitalization = function (string) {
    var stringArr = string.split(" ");
    var fixedString = "";
    for (i = 0; i < stringArr.length; i++) {
        var lowerCaseString = stringArr[i].toLowerCase();
        var fixedStringPiece = lowerCaseString.charAt(0).toUpperCase() + lowerCaseString.slice(1);
        fixedString += " " + fixedStringPiece;
    };
    return fixedString.trim();
};

var convertDate = function (fullDate) {
    var fullDateArr = fullDate.split("-");
    var year = fullDateArr[0];
    var month = monthsArr[fullDateArr[1] - 1];
    var date = fullDateArr[2];
    var newDate = month + " " + date + " " + year;
    return newDate;
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
            reorderedSearchHistoryArr(searchedCity);
            createSearchHistoryBtns();
        };
        // Removes focus from the clicked button
        event.target.blur();
    }
};

var removeOldSearchBtns = function () {
    var child = searchHistoryEl.lastElementChild;
    while (child) {
        searchHistoryEl.removeChild(child);
        child = searchHistoryEl.lastElementChild;
    }
};

var loadSavedHistory = function () {
    searchHistoryArr = JSON.parse(localStorage.getItem("searchHistory"));
};

var reorderedSearchHistoryArr = function (cityName) {
    var reorderedArr = searchHistoryArr.filter(function (city) {
        return city != cityName;
    });
    reorderedArr.unshift(cityName);
    searchHistoryArr = reorderedArr;
    console.log(searchHistoryArr);
}
// END FUNCTION DECLARATIONS



// BEGIN EVENT LISTENERS
searchEl.addEventListener("click", buttonHandler);
// END EVENT LISTENERS



// BEGIN FUNCTIONS TO RUN ON LOAD
loadSavedHistory();
createSearchHistoryBtns();
console.log(searchHistoryArr);
// END FUNCTIONS TO RUN ON LOAD