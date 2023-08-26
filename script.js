const apiKey = "bfd8982d9bd4680fcb4ad78530593ded";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const listContainer = document.getElementById("list-container");
const deleteAllButton = document.getElementById("delete-all");

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

let intervalId;

async function checkWeather(city) {

    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

    if (response.status == 404) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
        document.querySelector(".clock").style.display = "none";
    }
    else {

        var data = await response.json();


        console.log(data);

        changeWeatherData(data);
        changeWeatherImage(data);
        checkIfExistInList(data.name, data);
        outputActualTime(data);

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".clock").style.display = "block";
        document.querySelector(".error").style.display = "none";
    }
    searchBox.value = "";
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

listContainer.addEventListener("click", function (e) {
    if (e.target.tagName === "LI") {
        checkWeather(e.target.textContent);
    }
}, false)

deleteAllButton.addEventListener("click", () => {
    listContainer.innerHTML = "";
})