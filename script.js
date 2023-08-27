const apiKey = "bfd8982d9bd4680fcb4ad78530593ded";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const apiUrlForecast = "https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=";

const forecastContainer = document.getElementById("forecast-container");
const listContainer = document.getElementById("list-container");
const deleteAllButton = document.getElementById("delete-all");

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

let intervalId;

//Main function to check the weather
async function checkWeather(city) {

    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

    if (response.status == 404) {
        showError();
    }
    else {
        var data = await response.json();
        console.log(data);
        await updateWeatherData(data);
    }
    searchBox.value = "";
}

//Check the 5 days forecast
function changeForecastData(forecastData) {
    let num = 1;
    let day = new Date(forecastData.list[0].dt * 1000).getDate();
    let month = new Date(forecastData.list[0].dt * 1000).getMonth();
    let forecastHTML = '';

    for (let i = 0; i < forecastData.cnt - 1; i++) {
        const fDay = new Date(forecastData.list[i].dt * 1000).getDate();
        
        if (fDay !== day) {
            day = fDay;
            month = forecastData.list[i].dt_txt.substring(5,7);
            const formattedDay = `<li id="day${num}">Day: ${day} / ${month} - Temp: ${Math.round(forecastData.list[i].main.temp)}°c - Humidity: ${forecastData.list[i].main.humidity} - Wind: ${forecastData.list[i].wind.speed} km/h</li>`;
            forecastHTML += formattedDay;
            num++;
        }
    }
    
    forecastContainer.innerHTML = forecastHTML;
}

//Function to get the json of the 5 day forecast of the searched city
async function checkForecast(lat, lon) {
    const response = await fetch(apiUrlForecast + lat + `&lon=${lon}&appid=${apiKey}`);

    var data = await response.json();

    console.log(data);

    changeForecastData(data);
}

//Output the time of the searched city based on the UTC and calculated with de timezone's atribute
function outputActualTime(data) {
    const output = document.querySelector(".clock output");

    if (intervalId) {
        clearInterval(intervalId);
    }

    intervalId = setInterval(() => {
        const inputCityTime = luxon.DateTime.now().toUTC(data.timezone / 60);
        output.innerHTML = inputCityTime.toFormat("HH:mm:ss");

    }, 1000);
}

//Change the actual weather, forecast and the messages of the page
async function updateWeatherData(data) {
    await checkForecast(data.coord.lat, data.coord.lon);
    changeWeatherData(data);
    changeWeatherImage(data);
    checkIfExistInList(data.name, data);
    outputActualTime(data);

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".clock").style.display = "block";
    document.querySelector(".forecast").style.display = "block";
    document.querySelector(".error").style.display = "none";
}

//If the status is 404, shows a message to the user
function showError() {
    document.querySelector(".error").style.display = "block";
    document.querySelector(".forecast").style.display = "none";
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".clock").style.display = "none";
}

//To get the data of the weather from the Json
function changeWeatherData(data) {
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
}

//To change the icon depending on the weather
function changeWeatherImage(data) {
    if (data.weather[0].main == "Clouds") weatherIcon.src = "img/clouds.png";
    else if (data.weather[0].main == "Clear") weatherIcon.src = "img/clear.png";
    else if (data.weather[0].main == "Rain") weatherIcon.src = "img/rain.png";
    else if (data.weather[0].main == "Drizzle") weatherIcon.src = "img/drizzle.png";
    else if (data.weather[0].main == "Mist") weatherIcon.src = "img/mist.png";
}

//Add a city to the <ul> "list-container" as a <li> inside of it
function addCityToList(data) {
    let li = document.createElement("li");

    li.innerHTML = data.name;

    listContainer.appendChild(li);

}

//Check if the city exists in the previous searched cities, if true, the function delete the old one
function checkIfExistInList(input, data) {
    const liElements = listContainer.querySelectorAll("li");
    liElements.forEach(li => {
        if (li.textContent == input) {
            li.remove();
        }
    })

    addCityToList(data);
}

//To search with the Enter key
searchBox.addEventListener("keypress", function (e) {
    if (e.key == "Enter") {
        e.preventDefault();
        checkWeather(searchBox.value);
    }
})

//To search with a click in the icon
searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

//Check the weathe by clicking some city inside of the searched cities list
listContainer.addEventListener("click", function (e) {
    if (e.target.tagName === "LI") {
        checkWeather(e.target.textContent);
    }
}, false)

//Delete all the elements of a list
deleteAllButton.addEventListener("click", () => {
    listContainer.innerHTML = "";
})