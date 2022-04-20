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
                            if (searchBtnPressed == true) {
                                if (!searchHistoryArr.includes(city)) {
                                    searchHistoryArr.unshift(city);
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
                        for (i = 0; i < data.list.length; i++) {
                            var dateAndTimeArr = data.list[i].dt_txt.split(" ");
                            if (dateAndTimeArr[1] == "00:00:00") {
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

// Function for handling the button clicks
var buttonHandler = function (event) {
    // Checks if the click target was a button
    if (event.target.classList.contains("btn")) {
        // Checks if the clicked button was the search button
        if (event.target.classList.contains("btn-primary")) {
            // Fixes the capitalization of the input and trims it
            searchedCity = properCapitalization(searchInputEl.value);
            // Resets the input field
            searchInputEl.value = "";
            // Sets searchBtnPressed to true
            searchBtnPressed = true;
            // Displays the weather information
            getCurrentCityWeather(searchedCity);
        };
        // Checks if the clicked button was in the search history
        if (event.target.classList.contains("btn-secondary")) {
            // Gets the city to search from the button text content
            searchedCity = event.target.textContent;
            // Displays the weather information
            getCurrentCityWeather(searchedCity);
            // Reorders the citys in the searchHistoryArr
            reorderedSearchHistoryArr(searchedCity);
            // Recreates the buttons with the most recently clicked city from the search history at the top
            createSearchHistoryBtns();
        };
        // Removes focus from the clicked button
        event.target.blur();
    }
};

// Removes all of the search history buttons
var removeOldSearchBtns = function () {
    // The child variable is assigned the last child of the searchHistoryEl <div>
    var child = searchHistoryEl.lastElementChild;
    // While child is still defined...
    while (child) {
        // ...Remove that child
        searchHistoryEl.removeChild(child);
        // Reassign the child variable to be the last child if there still is one
        child = searchHistoryEl.lastElementChild;
    }
};

// Loads the cities that have been searched before which were stored in an array
var loadSavedHistory = function () {
    searchHistoryArr = JSON.parse(localStorage.getItem("searchHistory"));
};

// Rearranges the order of the search history buttons so that the most recently searched city is at the top
var reorderedSearchHistoryArr = function (cityName) {
    // Creates a new array that has had "cityName" removed
    var reorderedArr = searchHistoryArr.filter(function (city) {
        return city != cityName;
    });
    // Puts "cityName" back in at the front of this new array
    reorderedArr.unshift(cityName);
    // Reassigns the values in searchHistoryArr to those of this new array
    searchHistoryArr = reorderedArr;
}
// END FUNCTION DECLARATIONS



// BEGIN EVENT LISTENERS
searchEl.addEventListener("click", buttonHandler);
// END EVENT LISTENERS



// BEGIN FUNCTIONS TO RUN ON LOAD
loadSavedHistory();
createSearchHistoryBtns();
// END FUNCTIONS TO RUN ON LOAD