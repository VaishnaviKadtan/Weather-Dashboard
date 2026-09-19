const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

async function getWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        weatherResult.innerHTML = `
            <p>Please enter a city name.</p>
        `;
        return;
    }

    weatherResult.innerHTML = `
        <div class="loading">
            <div class="loader"></div>
            <p>Fetching weather data...</p>
        </div>
    `;

    try {
        // Find city coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to find location");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            weatherResult.innerHTML = `
                <p>City not found. Please try another city.</p>
            `;
            return;
        }

        const location = geoData.results[0];

        // Get weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        const condition = getWeatherCondition(current.weather_code);
        const icon = getWeatherIcon(current.weather_code);

        const currentDate = new Date();

        const dateOptions = {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        };

        const formattedDate = currentDate.toLocaleDateString(
            "en-IN",
            dateOptions
        );

        weatherResult.innerHTML = `
            <div class="weather-main">

                <div class="weather-icon">
                    ${icon}
                </div>

                <h2>${location.name}, ${location.country}</h2>

                <p class="date">
                    ${formattedDate}
                </p>

                <div class="temperature">
                    ${current.temperature_2m}°C
                </div>

                <p class="condition">
                    ${condition}
                </p>

            </div>

            <div class="weather-details">

                <div class="weather-card">
                    <span>💧</span>
                    <h3>Humidity</h3>
                    <p>${current.relative_humidity_2m}%</p>
                </div>

                <div class="weather-card">
                    <span>💨</span>
                    <h3>Wind Speed</h3>
                    <p>${current.wind_speed_10m} km/h</p>
                </div>

            </div>
        `;

    } catch (error) {
        console.error(error);

        weatherResult.innerHTML = `
            <p>
                Something went wrong. Please check your internet connection
                and try again.
            </p>
        `;
    }
}


// Weather condition
function getWeatherCondition(code) {

    if (code === 0) {
        return "Clear Sky";

    } else if (code === 1 || code === 2) {
        return "Partly Cloudy";

    } else if (code === 3) {
        return "Overcast";

    } else if (code === 45 || code === 48) {
        return "Foggy";

    } else if (code >= 51 && code <= 67) {
        return "Rainy";

    } else if (code >= 71 && code <= 77) {
        return "Snowy";

    } else if (code >= 80 && code <= 82) {
        return "Rain Showers";

    } else if (code >= 95) {
        return "Thunderstorm";

    } else {
        return "Unknown Weather";
    }
}


// Weather icon
function getWeatherIcon(code) {

    if (code === 0) {
        return "☀️";

    } else if (code === 1 || code === 2) {
        return "🌤️";

    } else if (code === 3) {
        return "☁️";

    } else if (code === 45 || code === 48) {
        return "🌫️";

    } else if (code >= 51 && code <= 67) {
        return "🌧️";

    } else if (code >= 71 && code <= 77) {
        return "❄️";

    } else if (code >= 80 && code <= 82) {
        return "🌦️";

    } else if (code >= 95) {
        return "⛈️";

    } else {
        return "🌍";
    }
}