import React, { useState, useEffect } from 'react';
import { calculateHijriDate } from '../utils/prayer';
import { Moon, Sun, Sparkles } from 'lucide-react';

interface ClockSectionProps {
  use24HourClock: boolean;
  onToggleNightMode: () => void;
  isNightMode: boolean;
}

export const ClockSection: React.FC<ClockSectionProps> = ({
  use24HourClock,
  onToggleNightMode,
  isNightMode,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hijri = calculateHijriDate(currentTime);

  // Time strings
  let hours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  let ampm = '';

  if (!use24HourClock) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
  }
  const displayHours = use24HourClock ? String(hours).padStart(2, '0') : String(hours);

  // Date strings
  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          {/* Big Glanceable Kitchen Time */}
          <div className="flex items-baseline tracking-tight">
            <span className="font-extrabold text-5xl sm:text-6xl text-amber-50 font-mono tabular-nums leading-none drop-shadow-sm">
              {displayHours}:{minutes}
            </span>
            <span className="text-xl sm:text-2xl text-amber-400/80 font-mono tabular-nums ml-1 font-semibold">
              :{seconds}
            </span>
            {!use24HourClock && (
              <span className="ml-2 text-base font-bold text-amber-300/90 tracking-wide uppercase">
                {ampm}
              </span>
            )}
          </div>

          {/* Full Gregorian Date */}
          <div className="mt-1 flex items-center gap-2 text-stone-200">
            <span className="font-bold text-base sm:text-lg text-amber-400">
              {dayName}
            </span>
            <span className="text-stone-500 font-light">·</span>
            <span className="text-sm sm:text-base font-medium text-stone-300">
              {monthDay}
            </span>
          </div>

          {/* Islamic Hijri Calendar Date */}
          <div className="mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm text-stone-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500/80" />
            <span className="font-medium tracking-wide text-stone-300">
              {hijri.formatted}
            </span>
          </div>
        </div>

        {/* Quick Ambient Sleep / Dim Button */}
        <button
          onClick={onToggleNightMode}
          title={isNightMode ? 'Wake Screen' : 'Dim Screen / Night Mode'}
          className="touch-btn min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/60 flex items-center gap-1.5 text-stone-300 active:scale-95 transition-all text-xs font-semibold shadow-sm"
        >
          {isNightMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Wake</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-300" />
              <span className="hidden sm:inline">Night Dim</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
