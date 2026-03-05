// função pra retornar o gif de fundo e o icon do clima
export const get_visuals = (weather_code, is_day) => {
  if (weather_code === 0)
    return is_day
      ? { icon: "☀️", bg: "/clean_sky.jpg" }
      : { icon: "🌙", bg: "/clean_sky_night.jpg" };

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
