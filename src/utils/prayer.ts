import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { PrayerTimesData, AppSettings } from '../types/dashboard';

// Hijri Month names in English
const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qadah',
  'Dhu al-Hijjah',
];

export function calculateHijriDate(date: Date = new Date()): {
  day: number;
  month: string;
  year: number;
  formatted: string;
} {
  try {
    // Try browser Intl format with Islamic calendar
    const intlFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = intlFormatter.formatToParts(date);
    let day = 1;
    let monthIdx = 0;
    let year = 1448;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10);
      if (part.type === 'month') monthIdx = parseInt(part.value, 10) - 1;
      if (part.type === 'year') {
        const parsedYear = parseInt(part.value.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsedYear)) year = parsedYear;
      }
    }

    if (monthIdx < 0 || monthIdx >= HIJRI_MONTHS.length) {
      monthIdx = 2; // Default to Rabi al-Awwal for late 2026
    }

    const monthName = HIJRI_MONTHS[monthIdx];
    return {
      day: isNaN(day) ? 24 : day,
      month: monthName,
      year: isNaN(year) ? 1448 : year,
      formatted: `${isNaN(day) ? 24 : day} ${monthName} ${year} AH`,
    };
  } catch {
    // Fallback static calculation
    return {
      day: 24,
      month: 'Rabi al-Awwal',
      year: 1448,
      formatted: '24 Rabi al-Awwal 1448 AH',
    };
  }
}

function formatPrayerTime(date: Date, use24Hour: boolean): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  if (use24Hour) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function getPrayerTimesForDate(
  date: Date,
  settings: AppSettings
): PrayerTimesData {
  const coordinates = new Coordinates(settings.latitude, settings.longitude);

  let params;
  switch (settings.prayerCalculationMethod) {
    case 'MuslimWorldLeague':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    default:
      params = CalculationMethod.NorthAmerica();
  }

  if (settings.asrMadhab === 'Hanafi') {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const now = date.getTime();

  // Create Date objects for prayers
  const fajrDate = prayerTimes.fajr;
  const sunriseDate = prayerTimes.sunrise;
  const dhuhrDate = prayerTimes.dhuhr;
  const asrDate = prayerTimes.asr;
  const maghribDate = prayerTimes.maghrib;
  const ishaDate = prayerTimes.isha;

  // Find next prayer
  const prayersList: Array<{ name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'; timeDate: Date }> = [
    { name: 'Fajr', timeDate: fajrDate },
    { name: 'Sunrise', timeDate: sunriseDate },
    { name: 'Dhuhr', timeDate: dhuhrDate },
    { name: 'Asr', timeDate: asrDate },
    { name: 'Maghrib', timeDate: maghribDate },
    { name: 'Isha', timeDate: ishaDate },
  ];

  let nextPrayer = prayersList.find(p => p.timeDate.getTime() > now);
  let previousPrayerTime = fajrDate.getTime();

  // If all prayers today passed, next is tomorrow's Fajr
  if (!nextPrayer) {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowPrayers = new PrayerTimes(coordinates, tomorrow, params);
    nextPrayer = { name: 'Fajr', timeDate: tomorrowPrayers.fajr };
    previousPrayerTime = ishaDate.getTime();
  } else {
    const idx = prayersList.indexOf(nextPrayer);
    if (idx > 0) {
      previousPrayerTime = prayersList[idx - 1].timeDate.getTime();
    } else {
      // Prior to today's Fajr, previous was yesterday's Isha
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayPrayers = new PrayerTimes(coordinates, yesterday, params);
      previousPrayerTime = yesterdayPrayers.isha.getTime();
    }
  }

  const diffMs = Math.max(0, nextPrayer.timeDate.getTime() - now);
  const remainingSeconds = Math.floor(diffMs / 1000);

  const hoursLeft = Math.floor(remainingSeconds / 3600);
  const minutesLeft = Math.floor((remainingSeconds % 3600) / 60);
  const secondsLeft = remainingSeconds % 60;

  let formattedCountdown = '';
  if (hoursLeft > 0) {
    formattedCountdown = `${hoursLeft}h ${minutesLeft}m`;
  } else if (minutesLeft > 0) {
    formattedCountdown = `${minutesLeft}m ${secondsLeft}s`;
  } else {
    formattedCountdown = `${secondsLeft}s`;
  }

  // Calculate progress percentage between previous and next prayer
  const totalDuration = nextPrayer.timeDate.getTime() - previousPrayerTime;
  const elapsed = now - previousPrayerTime;
  const progressPercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  return {
    fajr: formatPrayerTime(fajrDate, settings.use24HourClock),
    sunrise: formatPrayerTime(sunriseDate, settings.use24HourClock),
    dhuhr: formatPrayerTime(dhuhrDate, settings.use24HourClock),
    asr: formatPrayerTime(asrDate, settings.use24HourClock),
    maghrib: formatPrayerTime(maghribDate, settings.use24HourClock),
    isha: formatPrayerTime(ishaDate, settings.use24HourClock),
    nextPrayer: {
      name: nextPrayer.name,
      time: formatPrayerTime(nextPrayer.timeDate, settings.use24HourClock),
      remainingSeconds,
      formattedCountdown,
    },
    progressPercentage,
    hijriDate: calculateHijriDate(date),
    date: date.toISOString().split('T')[0],
  };
}

// Gentle serene kitchen chime for prayer notification using Web Audio API
export function playGentleKitchenChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Bell harmonic fundamental and fifth (E5 659.25Hz and B5 987.77Hz)
    const freqs = [659.25, 987.77, 1318.5];

    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      // Warm attack and decaying bell sustain
      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.18 / (index + 1), now + index * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 2.4);
    });
  } catch {
    // Audio context may be blocked by autoplay policies until user touches screen
  }
}
