import { WeatherCondition } from '../types/dashboard';

const CACHE_KEY = 'kitchen_dashboard_weather_cache';

export function getWeatherConditionDescription(code: number, isDay: boolean = true): string {
  switch (code) {
    case 0:
      return isDay ? 'Sunny' : 'Clear Sky';
    case 1:
      return isDay ? 'Mainly Sunny' : 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Foggy';
    case 51:
    case 53:
    case 55:
      return 'Light Drizzle';
    case 56:
    case 57:
      return 'Freezing Drizzle';
    case 61:
      return 'Light Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
      return 'Light Snow';
    case 73:
      return 'Moderate Snow';
    case 75:
      return 'Heavy Snow';
    case 77:
      return 'Snow Grains';
    case 80:
    case 81:
    case 82:
      return 'Passing Showers';
    case 85:
    case 86:
      return 'Snow Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with Hail';
    default:
      return 'Partly Cloudy';
  }
}

export function getDefaultWeatherData(tempUnit: 'F' | 'C' = 'F'): WeatherCondition {
  const isF = tempUnit === 'F';
  return {
    temperature: isF ? 68 : 20,
    apparentTemperature: isF ? 67 : 19,
    conditionCode: 2,
    conditionText: 'Partly Cloudy',
    isDay: true,
    humidity: 52,
    windSpeed: isF ? 8 : 13,
    precipitationProbability: 10,
    tempMax: isF ? 73 : 23,
    tempMin: isF ? 56 : 13,
    uvIndex: 4,
    hourlyForecast: [
      { time: '09:00', temperature: isF ? 64 : 18, conditionCode: 1, conditionText: 'Sunny', precipitationProbability: 0 },
      { time: '12:00', temperature: isF ? 71 : 22, conditionCode: 2, conditionText: 'Partly Cloudy', precipitationProbability: 5 },
      { time: '15:00', temperature: isF ? 73 : 23, conditionCode: 2, conditionText: 'Partly Cloudy', precipitationProbability: 10 },
      { time: '18:00', temperature: isF ? 68 : 20, conditionCode: 1, conditionText: 'Clear', precipitationProbability: 0 },
      { time: '21:00', temperature: isF ? 60 : 16, conditionCode: 0, conditionText: 'Clear Sky', precipitationProbability: 0 },
    ],
    dailyForecast: [
      { date: 'Today', dayName: 'Today', tempMax: isF ? 73 : 23, tempMin: isF ? 56 : 13, conditionCode: 2, conditionText: 'Partly Cloudy', precipitationProbability: 10 },
      { date: 'Tomorrow', dayName: 'Wed', tempMax: isF ? 75 : 24, tempMin: isF ? 58 : 14, conditionCode: 1, conditionText: 'Mostly Sunny', precipitationProbability: 5 },
      { date: 'Day3', dayName: 'Thu', tempMax: isF ? 70 : 21, tempMin: isF ? 55 : 13, conditionCode: 61, conditionText: 'Light Rain', precipitationProbability: 60 },
      { date: 'Day4', dayName: 'Fri', tempMax: isF ? 68 : 20, tempMin: isF ? 52 : 11, conditionCode: 2, conditionText: 'Partly Cloudy', precipitationProbability: 20 },
    ],
    lastUpdated: new Date().toISOString(),
    isCached: false,
  };
}

export async function fetchLiveWeather(
  latitude: number,
  longitude: number,
  tempUnit: 'F' | 'C' = 'F'
): Promise<WeatherCondition> {
  const unitParam = tempUnit === 'F' ? 'fahrenheit' : 'celsius';
  const windUnit = tempUnit === 'F' ? 'mph' : 'kmh';

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=${unitParam}&wind_speed_unit=${windUnit}&timeformat=iso8601&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for resilient kitchen appliance

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather API returned status: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    // Build hourly slice (next 5 key intervals)
    const currentHourIndex = new Date().getHours();
    const hourlyForecast: WeatherCondition['hourlyForecast'] = [];
    if (hourly && hourly.time) {
      for (let i = currentHourIndex; i < Math.min(currentHourIndex + 12, hourly.time.length); i += 2) {
        if (hourly.time[i]) {
          const timeStr = hourly.time[i].split('T')[1]?.substring(0, 5) || `${i}:00`;
          hourlyForecast.push({
            time: timeStr,
            temperature: Math.round(hourly.temperature_2m[i]),
            conditionCode: hourly.weather_code[i],
            conditionText: getWeatherConditionDescription(hourly.weather_code[i], true),
            precipitationProbability: hourly.precipitation_probability ? hourly.precipitation_probability[i] || 0 : 0,
          });
        }
      }
    }

    // Build daily forecast
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyForecast: WeatherCondition['dailyForecast'] = [];
    if (daily && daily.time) {
      for (let i = 0; i < Math.min(4, daily.time.length); i++) {
        const dateObj = new Date(daily.time[i] + 'T12:00:00');
        const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[dateObj.getDay()];
        dailyForecast.push({
          date: daily.time[i],
          dayName: dayLabel,
          tempMax: Math.round(daily.temperature_2m_max[i]),
          tempMin: Math.round(daily.temperature_2m_min[i]),
          conditionCode: daily.weather_code[i],
          conditionText: getWeatherConditionDescription(daily.weather_code[i], true),
          precipitationProbability: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] || 0 : 0,
        });
      }
    }

    const weatherResult: WeatherCondition = {
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature),
      conditionCode: current.weather_code,
      conditionText: getWeatherConditionDescription(current.weather_code, current.is_day === 1),
      isDay: current.is_day === 1,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      precipitationProbability: dailyForecast[0]?.precipitationProbability ?? 0,
      tempMax: dailyForecast[0]?.tempMax ?? Math.round(current.temperature_2m + 5),
      tempMin: dailyForecast[0]?.tempMin ?? Math.round(current.temperature_2m - 5),
      hourlyForecast: hourlyForecast.slice(0, 5),
      dailyForecast,
      lastUpdated: new Date().toISOString(),
      isCached: false,
    };

    // Save to cache for offline resilience
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(weatherResult));
    } catch {
      // storage unavailable
    }

    return weatherResult;
  } catch {
    // If request fails (offline, bad internet, timeout), attempt reading from cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as WeatherCondition;
        parsed.isCached = true;
        return parsed;
      }
    } catch {
      // Ignore cache parse error
    }

    // Default static fallback if even cache is empty
    const fallback = getDefaultWeatherData(tempUnit);
    fallback.isCached = true;
    return fallback;
  }
}
