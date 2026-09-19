

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

    // Loading
    weatherResult.innerHTML = `
        <div class="loading">
            <div class="loader"></div>
            <p>Fetching weather data...</p>
        </div>
    `;

    try {

        // -----------------------------
        // STEP 1: Find City Coordinates
        // -----------------------------

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


        // -----------------------------
        // STEP 2: Get Weather Data
        // -----------------------------

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;
        const daily = weatherData.daily;


        // -----------------------------
        // STEP 3: Weather Information
        // -----------------------------

        const condition = getWeatherCondition(
            current.weather_code
        );

        const icon = getWeatherIcon(
            current.weather_code
        );


        // Current temperature
        const currentTemperature =
            current.temperature_2m;


        // Today's maximum temperature
        const maxTemperature =
            daily.temperature_2m_max[0];


        // Today's minimum temperature
        const minTemperature =
            daily.temperature_2m_min[0];


        // -----------------------------
        // STEP 4: Date
        // -----------------------------

        const weatherDate = new Date(
            daily.time[0] + "T12:00:00"
        );

        const dateOptions = {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        };

        const formattedDate =
            weatherDate.toLocaleDateString(
                "en-IN",
                dateOptions
            );


        // -----------------------------
        // STEP 5: Display Weather
        // -----------------------------

        weatherResult.innerHTML = `

            <div class="weather-main">

                <div class="weather-icon">
                    ${icon}
                </div>

                <h2>
                    ${location.name}, ${location.country}
                </h2>

                <p class="date">
                    ${formattedDate}
                </p>

                <div class="temperature">
                    ${currentTemperature}°C
                </div>

                <p class="condition">
                    ${condition}
                </p>

            </div>


            <div class="weather-details">

                <!-- Humidity -->

                <div class="weather-card">

                    <span>💧</span>

                    <h3>
                        Humidity
                    </h3>

                    <p>
                        ${current.relative_humidity_2m}%
                    </p>

                </div>


                <!-- Wind Speed -->

                <div class="weather-card">

                    <span>💨</span>

                    <h3>
                        Wind Speed
                    </h3>

                    <p>
                        ${current.wind_speed_10m} km/h
                    </p>

                </div>


                <!-- Today's High -->

                <div class="weather-card">

                    <span>🌡️</span>

                    <h3>
                        Today's High
                    </h3>

                    <p>
                        ${maxTemperature}°C
                    </p>

                </div>


                <!-- Today's Low -->

                <div class="weather-card">

                    <span>❄️</span>

                    <h3>
                        Today's Low
                    </h3>

                    <p>
                        ${minTemperature}°C
                    </p>

                </div>

            </div>
        `;

    } catch (error) {

        console.error(error);

        weatherResult.innerHTML = `
            <p>
                Something went wrong.
                Please check your internet connection
                and try again.
            </p>
        `;
    }
}


// =====================================
// WEATHER CONDITION
// =====================================

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


// =====================================
// WEATHER ICON
// =====================================

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
