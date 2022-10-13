// CONVERTER_API_URL = http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key};
// WEATHER_API_URL = https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}

const API_KEY = `fa7e5e1656b4a1aab9d8f97ada8a1f68`;

//make the request based upon user input (query)
//first, convert query to latitude and longitude, then make the weather API call
async function fetchData (query) {
    let res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=${API_KEY}`);
    let data = await res.json();
    let lat = data[0].lat;
    let lon = data[0].lon;
    try {
        let res = await fetch (`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        let data = await res.json();
        try {
            console.log(data);
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
    }
}

const form = document.querySelector("#form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    createQuery();
    fetchData(query);
})