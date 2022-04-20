// BEGIN QUERY SELECTORS
var searchEl = document.querySelector("#search");
var searchInputEl = document.querySelector("#searchInput");
var searchHistoryEl = document.querySelector("#searchHistory");
var cityEl = document.querySelector("#city");
var currentDateEl = document.querySelector("#currentDate");
var iconEl = document.querySelector("#icon");
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
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=792e4643b4781b31d71b6337cd249093&units=imperial")
        .then(function (response) {
            // Checks to see if the response was okay
            if (response.ok) {
                // Converts the response into a JSON object
                response.json()
                    // Runs this anonymous function on the response data
                    .then(function (data) {
                        // If a new search was made instead of using the search history buttons, searchBtnPressed will be true
                        if (searchBtnPressed == true) {
                            // Checks for an empty array in searchHistoryArr
                            if (!searchHistoryArr) {
                                // Assigns a value for the empty array
                                searchHistoryArr = [city];
                                // Creates a search history button
                                createSearchHistoryBtns();
                            };
                            // Checks if the searched for city is already in the search history buttons or not
                            if (!searchHistoryArr.includes(city)) {
                                // Adds the searched city to the searchHistoryArr array at the beginning
                                searchHistoryArr.unshift(city);
                                // Recreates the search history buttons to include the most recent search at the top
                                createSearchHistoryBtns();
                            };
                            // searchBtnPressed is set to false again
                            searchBtnPressed = false;
                        }
                        // updateCurrentCity() is called to update the text read-out and date
                        updateCurrentCity(city);
                        // Captures the lattitude and longitude
                        var lattitude = data.coord.lat;
                        var longitude = data.coord.lon;
                        // Gets the weather information and the five day forecast based on the lat. and long.
                        getWeather(lattitude, longitude);
                        fiveDayForecast(lattitude, longitude);
                    })
            }

            // Returns an alert and resets the searchBtnPressed variable if the response came back with issues
            else {
                alert("City not found")
                searchBtnPressed = false;
            }
        })
        // Handles any rejected cases with an alert. Also resets the searchBtnPressed variable
        .catch(function (error) {
            alert("Unable to connect to Openweathermap.org");
            searchBtnPressed = false;
        });
};

// Updates the city and date text
var updateCurrentCity = function (city) {
    // Updates the current city text in the <span> element with the "city" ID
    cityEl.textContent = city + " ";
    // Assigns the current date to the currentDate variable
    var currentDate = new Date().toDateString();
    // Updates the current date text in the <span> element with the "currentDate" ID
    currentDateEl.textContent = "(" + currentDate + ")";
};

// Gets the current weather from the Open Weather Map API based on lattitude and longitude
var getWeather = function (lat, lon) {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&cnt=1&appid=792e4643b4781b31d71b6337cd249093&units=imperial")
        .then(function (response) {
            if (response.ok) {
                response.json()
                    .then(function (data) {
                        // Updates the current weather display based on fetched data
                        updateCurrentWeather(data);
                        // Constructs a url for the weather icon source
                        var iconSrc = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png";
                        // Sets the sourch of the image
                        iconEl.setAttribute("src", iconSrc);
                    })
            } else {
                // Alerts the user if there was a problem with the response
                alert("Error: There was a problem retrieving the current weather");
            }
        })
        // Alerts the user if unable to communicate with Open Weather Map
        .catch(function (error) {
            alert("Unable to connect to Openweathermap.org");
        });
};

// Gets the 5-day forecast from the Open Weather Map API based on lattitude and longitude
var fiveDayForecast = function (lat, lon) {
    // Clears out space from any previous forecasts
    removeOldForecast();
    fetch("https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=792e4643b4781b31d71b6337cd249093&units=imperial")
        .then(function (response) {
            if (response.ok) {
                response.json()
                    .then(function (data) {
                        // Loops through the results to sift through the returned information
                        for (i = 0; i < data.list.length; i++) {
                            // Splits the date from the time stamp
                            var dateAndTimeArr = data.list[i].dt_txt.split(" ");
                            // Selects based on the first time stamp for each day
                            if (dateAndTimeArr[1] == "00:00:00") {
                                // Calls the futureForecast() function with information retrieved by fetch
                                futureForecast(data.list[i], dateAndTimeArr[0]);
                            }
                        }
                    })
            } else {
                // Alerts the user if there was a problem with the response
                alert("Error: There was a problem retrieving the 5-day forecast");
            }
        })
        // Alerts the user if unable to communicate with Open Weather Map
        .catch(function (error) {
            alert("Unable to connect to Openweathermap.org");
        });
};

// Function for updating the current weather based on fetched data
var updateCurrentWeather = function (data) {
    // Sets the readout for temperature
    tempEl.textContent = data.current.temp + " °F";
    // Sets the readout for wind speed
    windEl.textContent = data.current.wind_speed + " MPH";
    // Sets the readout for humidity
    humidityEl.textContent = data.current.humidity + "%";
    // Sets the readout for UV index
    uvEl.textContent = data.current.uvi;
    // Sets the color for the UV index
    assessUvi(data.current.uvi);
};

// Function for assessing the severity of the UV index
var assessUvi = function (uvi) {
    // Removes any classes that may have been present from previous weather searches
    uvEl.classList.remove("bg-success", "bg-warning", "bg-danger");
    // If the UV index is 2 or below, it's favorable
    if (parseInt(uvi) <= 2) {
        uvEl.classList.add("bg-success");
    }

    // If greater than 2 and up to 7, it's moderate
    else if (parseInt(uvi) <= 7) {
        uvEl.classList.add("bg-warning");
    }

    // If greater than 7 it is severe
    else {
        uvEl.classList.add("bg-danger");
    };
};

// Creates a forecast card based on an object and a date
var futureForecast = function (arrObj, date) {
    // Creates a new <div> element
    var futureDayEl = document.createElement("div");
    // Gives it the appropriate classes
    futureDayEl.classList.add("bg-forecast", "text-light", "rounded", "col-10", "col-lg-2", "my-4", "mx-auto");
    // Creates a new <h4> element
    var futureDateEl = document.createElement("h4");
    // Converts the date that was passed into the function and assigns it to the text of the new <h4> element
    futureDateEl.textContent = convertDate(date);
    // Appends the <h4> element onto the initial <div> element
    futureDayEl.appendChild(futureDateEl);
    // Creates a new <img> element
    var futureIcon = document.createElement("img");
    // Captures the url contstruction for the img source in a variable based on information from the object that was passed into the function
    var iconSrc = "http://openweathermap.org/img/wn/" + arrObj.weather[0].icon + "@2x.png";
    // Sets the src attribute of the image as the url created previously
    futureIcon.setAttribute("src", iconSrc);
    // Appends the <h4> element onto the initial <div> element
    futureDayEl.appendChild(futureIcon);
    // Creates a new <p> element
    var futureTempEl = document.createElement("p");
    // Gives it text based on the object that was passed into the function
    futureTempEl.textContent = "Temp: " + arrObj.main.temp;
    // Appends the <p> element onto the initial <div> element
    futureDayEl.appendChild(futureTempEl);
    // Creates a new <p> element
    var futureWindEl = document.createElement("p");
    // Gives it text based on the object that was passed into the function
    futureWindEl.textContent = "Wind: " + arrObj.wind.speed + " MPH";
    // Appends the <p> element onto the initial <div> element
    futureDayEl.appendChild(futureWindEl);
    // Creates a new <p> element
    futureHumidityEl = document.createElement("p");
    // Gives it text based on the object that was passed into the function
    futureHumidityEl.textContent = "Humidity: " + arrObj.main.humidity + "%";
    // Appends the <p> element onto the initial <div> element
    futureDayEl.appendChild(futureHumidityEl);
    // Appends the initial <div> element onto the fiveDayForecastEl <div>
    fiveDayForecastEl.appendChild(futureDayEl);
};

// Removes the old 5-day forecast
var removeOldForecast = function () {
    // The child variable is assigned the last child of the fiveDayForecastEl <div>
    var child = fiveDayForecastEl.lastElementChild;
    // While child is still defined...
    while (child) {
        // ...Remove that child
        fiveDayForecastEl.removeChild(child);
        // Reassign the child variable to be the last child if there still is one
        child = fiveDayForecastEl.lastElementChild;
    }
};

// Dynamically creates buttons for the last 10 cities that were searched for
var createSearchHistoryBtns = function () {
    // Removes any buttons that were already present
    removeOldSearchBtns();
    // Loops through the saved search history in searchHistoryArr
    for (i = 0; i < searchHistoryArr.length; i++) {
        // Creates a new <button> element
        var newBtnEl = document.createElement("button");
        // Assigns the appropriate classes
        newBtnEl.setAttribute("class", "btn btn-history btn-block");
        // Adds the saved city names
        newBtnEl.textContent = searchHistoryArr[i];
        // Appends the new element to the searchHistoryEl <div>
        searchHistoryEl.appendChild(newBtnEl);
        // If the searchHistoryArr array is now 11, the last value is removed
        if (searchHistoryArr.length == 11) {
            searchHistoryArr.pop();
        };
    };
    localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
};

// Fixes the capitalization of the search terms used
var properCapitalization = function (string) {
    // Splits the string if the search term had more than one part
    var stringArr = string.split(" ");
    // Establishes a local variable that doesn't need to have any specific value yet
    var fixedString = "";
    // Loops through the saved array containing any parts of the search term
    for (i = 0; i < stringArr.length; i++) {
        // Changes the entire string to lower case
        var lowerCaseString = stringArr[i].toLowerCase();
        // Establishes a local variable that has the first letter capitalized added to a string containing the second letter on
        var fixedStringPiece = lowerCaseString.charAt(0).toUpperCase() + lowerCaseString.slice(1);
        // Adds a space and the fixed string piece to fixedString
        fixedString += " " + fixedStringPiece;
    };
    // Trims off any extra spaces and returns the fixed string
    return fixedString.trim();
};

// Converts the date retrieved from the API into a more appealing format
var convertDate = function (fullDate) {
    // Splits and stores the incoming date into an array
    var fullDateArr = fullDate.split("-");
    // Saves the year
    var year = fullDateArr[0];
    // Changes the month from a number to the abreviated form stored in the monthsArr array
    var month = monthsArr[fullDateArr[1] - 1];
    // Saves the date
    var date = fullDateArr[2];
    // Puts all of the obtained values into a string
    var newDate = month + " " + date + " " + year;
    // Returns the converted date
    return newDate;
};

// Function for handling the button clicks
var buttonHandler = function (event) {
    // Checks if the click target was a button
    if (event.target.classList.contains("btn")) {
        // Checks if the clicked button was the search button
        if (event.target.classList.contains("btn-search")) {
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
        if (event.target.classList.contains("btn-history")) {
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
if (searchHistoryArr) {
    createSearchHistoryBtns();
};
// END FUNCTIONS TO RUN ON LOAD