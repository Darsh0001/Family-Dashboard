import React, { useState, useEffect } from 'react';
import { calculateHijriDate } from '../utils/prayer';
import { Moon, Sparkles, Sun } from 'lucide-react';
import { PrayerTimesData } from '../types/dashboard';

interface NightModeOverlayProps {
  use24HourClock: boolean;
  prayerData: PrayerTimesData | null;
  onWake: () => void;
}

export const NightModeOverlay: React.FC<NightModeOverlayProps> = ({
  use24HourClock,
  prayerData,
  onWake,
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  let hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  let ampm = '';

  if (!use24HourClock) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
  }
  const displayHours = use24HourClock ? String(hours).padStart(2, '0') : String(hours);

  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const hijri = calculateHijriDate(time);

  return (
    <div
      onClick={onWake}
      onTouchStart={onWake}
      className="fixed inset-0 z-50 bg-[#07080a] cursor-pointer flex flex-col items-center justify-between p-8 select-none animate-in fade-in duration-300"
    >
      {/* Top gentle status */}
      <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold uppercase tracking-widest pt-4">
        <Moon className="w-4 h-4 text-amber-500/60" />
        <span>Kitchen Night Mode · Dimmed</span>
      </div>

      {/* Main minimal night clock */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="flex items-baseline font-mono font-extrabold text-7xl sm:text-8xl text-amber-500/70 tabular-nums tracking-tighter">
          <span>{displayHours}:{minutes}</span>
          {!use24HourClock && (
            <span className="text-xl sm:text-2xl text-amber-600/70 ml-3 font-sans uppercase font-bold">
              {ampm}
            </span>
          )}
        </div>

        <div className="mt-3 text-stone-500 font-medium text-lg sm:text-xl">
          <span className="text-amber-500/80 font-bold">{dayName}</span>
          <span className="mx-2 text-stone-700">·</span>
          <span>{monthDay}</span>
          <span className="mx-2 text-stone-700">·</span>
          <span className="text-stone-500 text-base">{hijri.formatted}</span>
        </div>

        {/* Next prayer subtle preview */}
        {prayerData && (
          <div className="mt-8 px-4 py-2 rounded-2xl bg-stone-950 border border-stone-800/60 text-stone-400 text-sm flex items-center gap-2 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-500/60" />
            <span>Next: <strong className="text-amber-400/80 font-semibold">{prayerData.nextPrayer.name}</strong> at {prayerData.nextPrayer.time} ({prayerData.nextPrayer.formattedCountdown})</span>
          </div>
        )}
      </div>

      {/* Bottom Wake Touch Affordance */}
      <div className="pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/60 border border-stone-800 text-stone-500 text-xs font-semibold animate-pulse">
          <Sun className="w-3.5 h-3.5 text-amber-400/60" />
          <span>Tap anywhere to wake dashboard</span>
        </div>
      </div>
    </div>
  );
};
