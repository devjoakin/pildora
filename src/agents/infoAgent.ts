import { createAgent, tool } from 'langchain';
import { ChatOpenAI, tools } from '@langchain/openai';
import { z } from 'zod/v4';

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
});

function isLikelyLocation(value: string): boolean {
  const normalized = value.trim();

  if (normalized.length < 2 || normalized.length > 40) {
    return false;
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length > 4) {
    return false;
  }

  return /^[A-Za-z0-9À-ÿ .,'-]+$/.test(normalized);
}

/**
 * Custom weather tool
 */
export const getWeather = tool(
  async ({ location }) => {
    if (!isLikelyLocation(location)) {
      return JSON.stringify({
        status: 'ignored',
        content:
          'Skipped get_weather: the provided value is not a specific location.',
      });
    }

    // Use Open-Meteo geocoding API to get coordinates
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        location,
      )}&count=1`,
    );
    const geoData = await geoResponse.json();

    if (!geoData.results?.length) {
      return JSON.stringify({
        status: 'error',
        content: `Could not find location: ${location}`,
      });
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Fetch weather from Open-Meteo API (no API key required)
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`,
    );
    const weatherData = await weatherResponse.json();

    const {
      temperature_2m,
      weather_code,
      wind_speed_10m,
      relative_humidity_2m,
    } = weatherData.current;

    // Map weather codes to descriptions
    const weatherDescriptions: Record<number, string> = {
      0: 'Cielo despejado',
      1: 'Cielo parcialmente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla con depósito de escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna densa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve intensa',
      80: 'Chubascos ligeros',
      81: 'Chubascos moderados',
      82: 'Chubascos violentos',
      95: 'Tormenta',
    };
    const description =
      weatherDescriptions[weather_code] || 'Unknown conditions';

    return JSON.stringify({
      status: 'success',
      content: `Weather in ${name}, ${country}: ${description}, ${temperature_2m}°C, Wind: ${wind_speed_10m} km/h, Humidity: ${relative_humidity_2m}%`,
    });
  },
  {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    schema: z.object({
      location: z.string().describe('The city or location to get weather for'),
    }),
  },
);

export const infoAgent = createAgent({
  model,
  tools: [getWeather, tools.webSearch()],
  systemPrompt:
    'Eres un asistente general en espanol. REGLA ESTRICTA: solo puedes llamar get_weather cuando la pregunta sea explicitamente sobre clima/temperatura/pronostico y el usuario de una ubicacion concreta (ciudad, region o pais). Si la pregunta no trata de clima, esta incompleta, o no hay ubicacion clara, NO llames get_weather. En esos casos responde de forma normal o usa webSearch si se requiere informacion actualizada. No fuerces llamadas a herramientas.',
});
