import { useEffect, useState } from "react";
import { get_visuals } from "./getIcons";
import Loading from "./components/Loading";
import "./App.css";

function App() {
  const [cityInput, setCityInput] = useState("");
  const [countryInput, setCountryInput] = useState("");

  const [cityName, setCityName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const [weather, setWeather] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved_city = localStorage.getItem("last_city_search");
    const saved_country = localStorage.getItem("last_city_country_code");

    if (saved_city) setCityInput(saved_city);
    if (saved_country) setCountryInput(saved_country);
  }, []);

  const convert_city = async (city) => {
    const geo_res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=pt&format=json`,
    ).then((res) => res.json());

    if (!geo_res.results?.length) {
      throw new Error("Cidade não encontrada.");
    }

    if (countryInput) {
      const filtered = geo_res.results.find(
        (r) => r.country_code?.toLowerCase() === countryInput.toLowerCase(),
      );

      if (!filtered)
        throw new Error("Cidade não encontrada para o país informado.");

      return filtered;
    }

    return geo_res.results[0];
  };

  const fetch_city_weather = async (lat, lon) => {
    const weather_res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
    ).then((res) => res.json());

    return weather_res.current_weather;
  };

  const get_results = async (city) => {
    if (!city) {
      setError("Informe o nome de uma cidade.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const city_data = await convert_city(city);

      setCityName(city_data.name);
      setCountryCode(city_data.country_code);

      const current_weather = await fetch_city_weather(
        city_data.latitude,
        city_data.longitude,
      );

      setWeather(current_weather);

      const { icon, bg } = get_visuals(
        current_weather.weathercode,
        current_weather.is_day,
      );
      setWeatherIcon(icon);

      document.body.style.background = `url(${bg})`;
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    } catch (err) {
      setError(
        err.message ||
          "Erro ao buscar dados. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handle_submit = async (e) => {
    e.preventDefault();
    setWeather("");

    if (!cityInput) {
      setError("Erro ao buscar dados. Informe o nome de uma cidade.");
      return;
    }

    await get_results(cityInput);

    localStorage.setItem("last_city_search", cityInput);
    localStorage.setItem("last_city_country_code", countryInput);
  };

  return (
    <div className="overlay">
      <main>
        <h1>Weather APP :)</h1>

        <form onSubmit={handle_submit}>
          <input
            type="text"
            onChange={(e) => setCityInput(e.target.value)}
            value={cityInput}
            placeholder="Digite o nome da cidade..."
          />
          <input
            type="text"
            onChange={(e) => setCountryInput(e.target.value)}
            value={countryInput}
            placeholder="País (ex: BR, US)..."
            maxLength={2}
            style={{ textTransform: "uppercase" }}
          />
          <button type="submit">Consultar</button>
        </form>

        {error && <p className="error">{error}</p>}

        {loading && <Loading />}

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
  );
}

export default App;
