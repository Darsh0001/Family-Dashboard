import React from 'react';
import { WeatherCondition } from '../types/dashboard';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Wind,
  Droplets,
  RotateCw,
  WifiOff,
} from 'lucide-react';

interface WeatherSectionProps {
  weather: WeatherCondition | null;
  tempUnit: 'F' | 'C';
  cityName: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({
  weather,
  tempUnit,
  cityName,
  isRefreshing,
  onRefresh,
}) => {
  const getWeatherIcon = (code: number, isDay: boolean = true, className = 'w-7 h-7') => {
    if (code === 0 || code === 1) {
      return isDay ? (
        <Sun className={`${className} text-amber-400`} />
      ) : (
        <Sun className={`${className} text-amber-200`} />
      );
    }
    if (code === 2) {
      return <CloudSun className={`${className} text-amber-300`} />;
    }
    if (code === 3 || code === 45 || code === 48) {
      return <Cloud className={`${className} text-stone-400`} />;
    }
    if (code >= 51 && code <= 57) {
      return <CloudDrizzle className={`${className} text-sky-400`} />;
    }
    if (code >= 61 && code <= 67 || (code >= 80 && code <= 82)) {
      return <CloudRain className={`${className} text-blue-400`} />;
    }
    if (code >= 71 && code <= 77 || code === 85 || code === 86) {
      return <CloudSnow className={`${className} text-sky-200`} />;
    }
    if (code >= 95) {
      return <CloudLightning className={`${className} text-amber-500`} />;
    }
    return <CloudSun className={`${className} text-amber-300`} />;
  };

  if (!weather) {
    return (
      <div className="kitchen-panel rounded-2xl p-4 flex items-center justify-center min-h-[140px] animate-pulse">
        <span className="text-sm text-stone-400">Loading kitchen weather...</span>
      </div>
    );
  }

  return (
    <div className="kitchen-panel rounded-2xl p-3.5 sm:p-4 relative overflow-hidden">
      {/* Header with location and refresh */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {cityName}
          </span>
          {weather.isCached && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500/90 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
              <WifiOff className="w-3 h-3" /> Cached
            </span>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="touch-btn p-1.5 -mr-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors"
          title="Refresh weather"
          aria-label="Refresh weather"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Main Condition Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800/60">
            {getWeatherIcon(weather.conditionCode, weather.isDay, 'w-9 h-9 sm:w-10 sm:h-10')}
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-4xl sm:text-5xl font-extrabold text-stone-100 font-mono tabular-nums leading-none">
                {weather.temperature}
              </span>
              <span className="text-2xl font-bold text-amber-400 ml-0.5">
                °{tempUnit}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-300 mt-1">
              {weather.conditionText}
            </div>
          </div>
        </div>

        {/* Micro stats: High/Low, humidity, wind */}
        <div className="text-right text-xs space-y-1 text-stone-400">
          <div className="font-semibold text-stone-200 font-mono tabular-nums">
            <span className="text-amber-400">H: {weather.tempMax}°</span>
            <span className="mx-1 text-stone-600">/</span>
            <span className="text-sky-300">L: {weather.tempMin}°</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-stone-300 font-mono tabular-nums">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-stone-300 font-mono tabular-nums">
            <Wind className="w-3.5 h-3.5 text-stone-400" />
            <span>{weather.windSpeed} {tempUnit === 'F' ? 'mph' : 'km/h'}</span>
          </div>
        </div>
      </div>

      {/* 4-Day Mini Forecast Strip */}
      <div className="mt-3 pt-2.5 border-t border-stone-800/80 grid grid-cols-4 gap-1.5 text-center">
        {weather.dailyForecast.slice(0, 4).map((day, idx) => (
          <div
            key={idx}
            className={`p-1.5 rounded-lg transition-colors ${
              idx === 0 ? 'bg-stone-800/50 border border-stone-700/50' : 'bg-transparent'
            }`}
          >
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-tight">
              {day.dayName}
            </div>
            <div className="my-1 flex justify-center">
              {getWeatherIcon(day.conditionCode, true, 'w-4 h-4')}
            </div>
            <div className="text-xs font-mono font-bold tabular-nums text-stone-200">
              {day.tempMax}°
            </div>
            <div className="text-[10px] font-mono tabular-nums text-stone-500">
              {day.tempMin}°
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
