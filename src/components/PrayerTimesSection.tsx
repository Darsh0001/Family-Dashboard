import React from 'react';
import { PrayerTimesData } from '../types/dashboard';
import { Volume2, VolumeX, BellRing, Sparkles } from 'lucide-react';
import { playGentleKitchenChime } from '../utils/prayer';

interface PrayerTimesSectionProps {
  prayerData: PrayerTimesData | null;
  prayerChimeEnabled: boolean;
  onToggleChime: () => void;
}

export const PrayerTimesSection: React.FC<PrayerTimesSectionProps> = ({
  prayerData,
  prayerChimeEnabled,
  onToggleChime,
}) => {
  if (!prayerData) {
    return (
      <div className="kitchen-panel rounded-2xl p-4 min-h-[110px] animate-pulse">
        <span className="text-sm text-stone-400">Calculating prayer times...</span>
      </div>
    );
  }

  const prayers = [
    { name: 'Fajr', time: prayerData.fajr },
    { name: 'Sunrise', time: prayerData.sunrise, isSunrise: true },
    { name: 'Dhuhr', time: prayerData.dhuhr },
    { name: 'Asr', time: prayerData.asr },
    { name: 'Maghrib', time: prayerData.maghrib },
    { name: 'Isha', time: prayerData.isha },
  ];

  const handleTestChime = () => {
    playGentleKitchenChime();
  };

  return (
    <div className="kitchen-panel rounded-2xl p-3 sm:p-4 relative">
      {/* Top Banner: Next Prayer Highlight & Live Countdown */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Next Prayer:
            </span>
            <span className="text-base sm:text-lg font-extrabold text-amber-400">
              {prayerData.nextPrayer.name}
            </span>
            <span className="text-xs text-stone-400">at</span>
            <span className="text-sm font-bold text-stone-200 font-mono tabular-nums">
              {prayerData.nextPrayer.time}
            </span>
          </div>
        </div>

        {/* Live Countdown Badge */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-600/50 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 tabular-nums">
              in {prayerData.nextPrayer.formattedCountdown}
            </span>
          </div>

          {/* Chime toggle & test button */}
          <button
            onClick={() => {
              onToggleChime();
              if (!prayerChimeEnabled) handleTestChime();
            }}
            className={`touch-btn p-2 rounded-lg border transition-colors ${
              prayerChimeEnabled
                ? 'bg-amber-900/40 border-amber-700/60 text-amber-400'
                : 'bg-stone-800/60 border-stone-700/50 text-stone-500 hover:text-stone-300'
            }`}
            title={prayerChimeEnabled ? 'Kitchen chime active (Tap to mute)' : 'Chime muted (Tap to activate)'}
          >
            {prayerChimeEnabled ? (
              <BellRing className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Progress bar to next prayer */}
      <div className="w-full bg-stone-800/80 h-1.5 rounded-full my-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${prayerData.progressPercentage}%` }}
        />
      </div>

      {/* 6 Prayer Badges Grid */}
      <div className="grid grid-cols-6 gap-1 sm:gap-2 pt-1 text-center">
        {prayers.map((prayer) => {
          const isNext = prayerData.nextPrayer.name === prayer.name;
          return (
            <div
              key={prayer.name}
              className={`py-2 px-1 rounded-xl transition-all ${
                isNext
                  ? 'bg-amber-500/20 border-2 border-amber-500 shadow-md shadow-amber-900/20 scale-[1.02]'
                  : prayer.isSunrise
                  ? 'bg-stone-900/40 border border-stone-800/40 opacity-75'
                  : 'bg-stone-900/70 border border-stone-800/80'
              }`}
            >
              <div
                className={`text-[11px] sm:text-xs font-semibold uppercase tracking-tight truncate ${
                  isNext
                    ? 'text-amber-400 font-bold'
                    : prayer.isSunrise
                    ? 'text-stone-400'
                    : 'text-stone-300'
                }`}
              >
                {prayer.name}
              </div>
              <div
                className={`text-xs sm:text-sm font-mono font-extrabold tabular-nums mt-0.5 ${
                  isNext ? 'text-amber-200' : 'text-stone-200'
                }`}
              >
                {prayer.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
