// CONVERTER_API_URL = http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key};
// WEATHER_API_URL = https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}

const API_KEY = `fa7e5e1656b4a1aab9d8f97ada8a1f68`;

//make the request based upon user input (query)
//first, convert query to latitude and longitude, then make the weather API call
let initialData;

async function fetchData (query) {
    let res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=${API_KEY}`);
    let data = await res.json();
    let lat = data[0].lat;
    let lon = data[0].lon;
    initialData = data;
    try {
        let res = await fetch (`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        let data = await res.json();
        try {
            return data;
        }
        catch (err) {
            console.error(err);
        }
    } catch(err) {
        console.error(err);
    }
}

//set the drop-down menu options to all available countries and US states
import { getCountries } from "country-state-picker";
import { states } from "./states";

const cityInput = document.querySelector("#cityInput");
const stateInput = document.querySelector("#stateInput");

states.forEach((state) => {
    let newState = document.createElement("option");
    newState.setAttribute("value", state.abbrev);
    newState.textContent = state.name;
    stateInput.appendChild(newState);
})

const countryInput = document.querySelector("#countryInput");
const countries = getCountries();

countries.forEach((country) => {
    let newCountry = document.createElement("option");
    newCountry.setAttribute("value", country.code);
    newCountry.textContent = country.name;
    countryInput.appendChild(newCountry);
})

//create the location query based upon user input
let query;

function createQuery () {
    let city = cityInput.value;
    let state = stateInput.value;
    let country = countryInput.value;

    if (state == "default" && country == "default") {
        query = city;
    } else if (country == "default") {
        query = `${city}, ${state}, us`;
    } else if (state == "default") {
        query = `${city}, ${country}`;
    } else {
        query = `${city}, ${state}, ${country}`;
    }
}


const tempDisplay = document.querySelector("#temperature")
const conditionsDisplay = document.querySelector("#conditions")
const otherDisplay = document.querySelector("#other-info")

const displayArea = document.querySelector("#display-weather-content");

const degrees = document.querySelector("#temp");
const feelsLike = document.querySelector("#feelsLike");
const highLow = document.querySelector("#highLow");

const description = document.querySelector("#description");

const windSpeed = document.querySelector("#windSpeed");
const visibility = document.querySelector("#visibility");
const humidity = document.querySelector("#humidity");

const body = document.querySelector("body");
const title = document.querySelector("#title-area");
const timeStamp = document.querySelector("#timestamp");

const saveAreaBtn = document.querySelector("#saveAreaBtn");
const resetBtn = document.querySelector("#resetBtn");

const savedAreasList = document.querySelector("#saved-areas-list");

function displayWeather (weatherObj, unitFunc) {
    displayArea.classList.remove("hidden");
    saveAreaBtn.classList.remove("not-visible");
    resetBtn.classList.remove("not-visible");
    saveAreaBtn.classList.add("visible");
    resetBtn.classList.add("visible");

    let time = weatherObj.dt;

    let date = new Date(time * 1000);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();

    let formattedTime = `${hours}:${minutes.substring(minutes.length-2)}:${seconds.substring(seconds.length-2)}`;
    timeStamp.textContent = `Updated at ${formattedTime}`;


    if (initialData[0].state == undefined) {
        title.textContent = `Weather for ${initialData[0].name}, ${initialData[0].country}`;
    } else {
        title.textContent = `Weather for ${initialData[0].name}, ${initialData[0].state}, ${initialData[0].country}`;
    }

    //set appropriate background image
    if (weatherObj.weather[0].main == "Clear") {
        body.classList.remove("rain-bg");
        body.classList.remove("snow-bg");
        body.classList.remove("cloud-bg");
        body.classList.add("sun-bg");
    } else if (weatherObj.weather[0].main == "Thunderstorm" || weatherObj.weather[0].main == "Drizzle" || weatherObj.weather[0].main == "Rain") {
        body.classList.remove("sun-bg");
        body.classList.remove("snow-bg");
        body.classList.remove("cloud-bg");
        body.classList.add("rain-bg");
    } else if (weatherObj.weather[0].main == "Snow") {
        body.classList.remove("rain-bg");
        body.classList.remove("sun-bg");
        body.classList.remove("cloud-bg");
        body.classList.add("snow-bg");
    } else if (weatherObj.weather[0].main == "Clouds") {
        body.classList.remove("rain-bg");
        body.classList.remove("snow-bg");
        body.classList.remove("sun-bg");
        body.classList.add("cloud-bg");
    } 

    const degreesKelvin = weatherObj.main.temp;
    degrees.textContent = `${unitFunc(degreesKelvin)}°`;

    const feelsLikeDegrees = weatherObj.main.feels_like;
    feelsLike.textContent = `Feels like ${unitFunc(feelsLikeDegrees)}°`;

    const high = Math.round(unitFunc(weatherObj.main.temp_max));
    const low = Math.round(unitFunc(weatherObj.main.temp_min));
    highLow.innerHTML = `<span class="bold">H:</span> ${high} <span class="bold">L:</span> ${low}`;

    let capitalizedDescription = (weatherObj.weather[0].description).replace(/^./, weatherObj.weather[0].description[0].toUpperCase());
    description.textContent = capitalizedDescription;

    const mpsToMph = 2.23694;
    let windSpeedMPH = Math.round(weatherObj.wind.speed*mpsToMph);
    let direction;
    if (weatherObj.wind.speed == 0) {
        direction = "";
    }else if (weatherObj.wind.deg == 0 || weatherObj.wind.deg == 360) {
        direction = "E";
    } else if (weatherObj.wind.deg == 90) {
        direction = "N";
    } else if (weatherObj.wind.deg == 180) {
        direction = "W";
    } else if (weatherObj.wind.deg == 270) {
        direction = "S";
    }else if (weatherObj.wind.deg > 270) {
        direction = "SE";
    } else if (weatherObj.wind.deg > 180) {
        direction = "SW";
    } else if (weatherObj.wind.deg > 90) {
        direction = "NW";
    } else if (weatherObj.wind.deg > 0) {
        direction = "NE";
    }

    windSpeed.textContent = `${windSpeedMPH}mph ${direction} winds`;

    const metersToMiles = 0.000621371;
    let visibilityMiles = Math.round(weatherObj.visibility*metersToMiles*10)/10;
    visibility.textContent = `Visibility of ${visibilityMiles} miles`;

    humidity.textContent = `${weatherObj.main.humidity}% humidity`;

    saveAreaBtn.addEventListener("click", addToList);
}

const warning = document.querySelector("#warning");

function addToList () {
    let found = false;
    
       if (Array.from(savedAreasList.children).length < 10) {
        Array.from(savedAreasList.children).forEach((element) => {
            if (element.innerText == initialData[0].name) {
                found = true;
            }
        });
        if (found == false) {
            let newSavedArea = {
                name: initialData[0].name,
                searchQuery: query
            };
            const li = document.createElement("li");
            li.textContent = newSavedArea.name;
            savedAreasList.appendChild(li);
            if (Array.from(savedAreasList.children).length == 9) {
                warning.classList.remove("not-visible");
                setTimeout(() => {
                    warning.classList.add("not-visible");
                }, 3000)
                saveAreaBtn.disabled = "disabled";
                saveAreaBtn.classList.add("disabled");
            }
            li.addEventListener("click", () => {
                if (unitSwitchBtn.checked) {
                    fetchData(newSavedArea.searchQuery).then((result) => {
                        return result;
                    }).then((result) => {
                        returnedObj = result;
                        activeUnit = "fahrenheit";
                        displayWeather(returnedObj, fahrenheitConverter);
                    });
                } else {
                    fetchData(newSavedArea.searchQuery).then((result) => {
                        return result;
                    }).then((result) => {
                        returnedObj = result;
                        activeUnit = "celsius";
                        displayWeather(returnedObj, celsiusConverter);
                    });
                }
                form.reset();
            })
        }
    }
}

//convert Kelvin to Fahrenheit and Celsius
function celsiusConverter(value) {
    return Math.round(value-273.15);
}

function fahrenheitConverter (value) {
    return Math.round(1.8*(value-273) + 32);
}

const form = document.querySelector("#form");
const unitSwitchBtn = document.querySelector("#unit-switch-button");
let activeUnit = "celsius";
let returnedObj;

form.addEventListener("submit", (e) => {
    e.preventDefault();
    createQuery();
    if (unitSwitchBtn.checked) {
        fetchData(query).then((result) => {
            return result;
        }).then((result) => {
            returnedObj = result;
            activeUnit = "fahrenheit";
            displayWeather(returnedObj, fahrenheitConverter);
        });
    } else {
        fetchData(query).then((result) => {
            return result;
        }).then((result) => {
            returnedObj = result;
            activeUnit = "celsius";
            displayWeather(returnedObj, celsiusConverter);
        });
    }
})

unitSwitchBtn.addEventListener("change", () => {
    if (activeUnit == "fahrenheit") {
        activeUnit = "celsius";
        displayWeather(returnedObj, celsiusConverter);
    } else {
        activeUnit = "fahrenheit";
        displayWeather(returnedObj, fahrenheitConverter);
    }
})

//make reset list button work
resetBtn.addEventListener("click", () => {
    savedAreasList.innerHTML = "";
})

