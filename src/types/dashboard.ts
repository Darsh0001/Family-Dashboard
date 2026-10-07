export interface FamilyMember {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  avatarIcon?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (24h or 12h)
  endTime?: string; // HH:mm
  allDay?: boolean;
  category: 'family' | 'school' | 'sports' | 'appointment' | 'work' | 'meal';
  familyMemberId?: string; // which family member it belongs to
  isGoogleSync?: boolean;
  location?: string;
  notes?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  assignedTo?: string; // familyMemberId or 'All'
  category: 'chores' | 'groceries' | 'school' | 'kitchen' | 'errands';
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
}

export interface WeatherCondition {
  temperature: number; // in chosen unit
  apparentTemperature: number;
  conditionCode: number;
  conditionText: string;
  isDay: boolean;
  humidity: number;
  windSpeed: number; // mph or km/h
  precipitationProbability: number;
  tempMax: number;
  tempMin: number;
  uvIndex?: number;
  hourlyForecast: Array<{
    time: string; // e.g. "10:00"
    temperature: number;
    conditionCode: number;
    conditionText: string;
    precipitationProbability: number;
  }>;
  dailyForecast: Array<{
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    conditionCode: number;
    conditionText: string;
    precipitationProbability: number;
  }>;
  lastUpdated: string;
  isCached: boolean;
}

export interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayer: {
    name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
    time: string;
    remainingSeconds: number;
    formattedCountdown: string;
  };
  progressPercentage: number;
  hijriDate: {
    day: number;
    month: string;
    year: number;
    formatted: string;
  };
  date: string;
}

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  description: string;
  logoText?: string;
}

export interface YouTubePreset {
  id: string;
  title: string;
  category: 'cooking' | 'quran' | 'kids' | 'ambience' | 'family';
  videoId: string; // YouTube video or playlist ID
  isPlaylist?: boolean;
  duration?: string;
}

export interface QuickNote {
  id: string;
  text?: string;
  drawingDataUrl?: string; // canvas drawing image
  authorId: string; // familyMemberId
  color: string; // sticky note tint
  createdAt: string;
  pinned?: boolean;
}

export interface AppSettings {
  cityName: string;
  latitude: number;
  longitude: number;
  tempUnit: 'F' | 'C';
  use24HourClock: boolean;
  prayerCalculationMethod: 'MuslimWorldLeague' | 'NorthAmerica' | 'Egyptian' | 'UmmAlQura' | 'Karachi' | 'Dubai';
  asrMadhab: 'Shafi' | 'Hanafi';
  prayerChimeAlert: boolean;
  nightModeEnabled: boolean;
  nightModeStartHour: number; // e.g. 22 (10 PM)
  nightModeEndHour: number; // e.g. 6 (6 AM)
  childLockEnabled: boolean;
  childLockPin: string;
  googleCalendarUrl: string;
  familyMembers: FamilyMember[];
}
