import { useState } from "react";
import "./App.css";

// Weather API: https://api.open-meteo.com/v1/forecast?latitude=-24.71361&longitude=-53.74306,&current_weather=true&timezone=auto
// GeoCoding API: https://geocoding-api.open-meteo.com/v1/search?name=Berlin&count=10&language=pt&format=json

function App() {
  const [cityInput, setCityInput] = useState("");
  const [weather, setWeather] = useState("");
  const [cityName, setCityName] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [countryInput, setCountryInput] = useState("");
  const [error, setError] = useState("");

  // função pra retornar o gif de fundo e o icon do clima
  const get_visuals = (weather_code, is_day) => {
    if (weather_code === 0)
      return is_day
        ? { icon: "☀️", bg: "/clean_sky.jpg" }
        : { icon: "🌙", bg: "/clean_sky_night.mp4" };

    if (
      (weather_code >= 1 && weather_code <= 3) ||
      (weather_code >= 45 && weather_code <= 48)
    )
      // tratando parcialmente dublado como se fosse totalmente nublado... pq sim :)
      return { icon: "⛅", bg: "/foggy.jpg" };

    if (weather_code >= 51 && weather_code <= 67)
      return { icon: "🌧️", bg: "/raining_background.gif" };

    if (weather_code >= 80 && weather_code <= 82)
      return { icon: "🌦️", bg: "/small_rain.gif" };

    if (weather_code === 95) return { icon: "⛈️", bg: "/storm.gif" };

    if (weather_code >= 71 && weather_code <= 77)
      return { icon: "❄️", bg: "/snow.jpg" };

    return { icon: "🌡️", bg: "/clean_sky.jpg" };
  };

  // função pra converter o nome da cidade em latitude, longitude
  const convert_city = async (city) => {
    const geo_res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=pt&format=json`,
    ).then((res) => res.json());

    if (countryInput) {
      const filtered = geo_res.results.find(
        (r) => r.country_code?.toLowerCase() === countryInput.toLowerCase(),
      );
      return filtered || geo_res.results[0];
    }

    return geo_res.results[0];
  };

  const handle_country_change = (e) => setCountryInput(e.target.value);
  const handle_change = (e) => setCityInput(e.target.value);

  const fetch_city_weather = async (lat, lon) => {
    const weather_res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
    ).then((res) => res.json());

    return weather_res.current_weather;
  };

  const handle_submit = async (e) => {
    e.preventDefault();
    setError("");
    setWeather("");

    try {
      const city_data = await convert_city(cityInput);

      if (!city_data) {
        setError("Cidade não encontrada. Tente outro nome ou país.");
        return;
      }

      const current_weather = await fetch_city_weather(
        city_data.latitude,
        city_data.longitude,
      );

      setWeather(current_weather);
      setCityName(city_data.name);
      setCountryCode(city_data.country_code);

      const { icon, bg } = get_visuals(
        current_weather.weathercode,
        current_weather.is_day,
      );
      setWeatherIcon(icon);
      document.body.style.background = `url(${bg})`;
      document.body.style.backgroundRepeat = `no-repeat`;
      document.body.style.backgroundSize = `cover`;
      document.body.style.backgroundPosition = `center`;
    } catch (err) {
      setError(
        "Erro ao buscar dados. Verifique sua conexão e tente novamente.",
      );
    }
  };

  return (
    <>
      <div className="overlay">
        <main>
          <h1>Weather APP :)</h1>

          <form onSubmit={handle_submit}>
            <input
              type="text"
              onChange={handle_change}
              value={cityInput}
              placeholder="Digite o nome da cidade..."
            />
            <input
              type="text"
              onChange={handle_country_change}
              value={countryInput}
              placeholder="País (ex: BR, US)..."
              maxLength={2}
              style={{ textTransform: "uppercase" }}
            />
            <button type="submit">Consultar</button>
          </form>

          {error && <p className="error">{error}</p>}

          {weather && (
            <div className="result">
              <h2>
                {cityName}
                <img src={`https://flagsapi.com/${countryCode}/flat/32.png`} />
              </h2>
              <p className="display_temperature">
                <span>{weatherIcon}</span> {weather.temperature} °C
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
