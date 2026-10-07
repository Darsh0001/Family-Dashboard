/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppSettings,
  CalendarEvent,
  TaskItem,
  QuickNote,
  WeatherCondition,
  PrayerTimesData,
  RadioStation,
  YouTubePreset,
} from './types/dashboard';
import { getPrayerTimesForDate, playGentleKitchenChime } from './utils/prayer';
import { fetchLiveWeather, getDefaultWeatherData } from './utils/weather';
import {
  getInitialCalendarEvents,
  DEFAULT_FAMILY_MEMBERS,
} from './utils/googleCalendar';
import {
  INITIAL_RADIO_STATIONS,
  INITIAL_YOUTUBE_PRESETS,
  getInitialTasks,
  getInitialQuickNotes,
} from './utils/presets';
import { ClockSection } from './components/ClockSection';
import { WeatherSection } from './components/WeatherSection';
import { PrayerTimesSection } from './components/PrayerTimesSection';
import { CalendarSection } from './components/CalendarSection';
import { TasksSection } from './components/TasksSection';
import { QuickNotesSection } from './components/QuickNotesSection';
import { MediaPlayerBar } from './components/MediaPlayerBar';
import { SettingsModal } from './components/SettingsModal';
import { GoogleCalendarModal } from './components/GoogleCalendarModal';
import { NightModeOverlay } from './components/NightModeOverlay';
import {
  Settings,
  Lock,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  Calendar,
  CheckSquare,
  PenTool,
  Sparkles,
} from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  cityName: 'Chicago, IL',
  latitude: 41.8781,
  longitude: -87.6298,
  tempUnit: 'F',
  use24HourClock: false,
  prayerCalculationMethod: 'NorthAmerica',
  asrMadhab: 'Shafi',
  prayerChimeAlert: true,
  nightModeEnabled: true,
  nightModeStartHour: 22, // 10 PM
  nightModeEndHour: 6, // 6 AM
  childLockEnabled: true,
  childLockPin: '1234',
  googleCalendarUrl: '',
  familyMembers: DEFAULT_FAMILY_MEMBERS,
};

export default function App() {
  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('kitchen_dashboard_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Calendar Events State
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('kitchen_dashboard_events');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return getInitialCalendarEvents();
  });

  // Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('kitchen_dashboard_tasks');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return getInitialTasks();
  });

  // Quick Notes State
  const [notes, setNotes] = useState<QuickNote[]>(() => {
    try {
      const saved = localStorage.getItem('kitchen_dashboard_quick_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return getInitialQuickNotes();
  });

  // Radio & YouTube Presets
  const [radioStations, setRadioStations] = useState<RadioStation[]>(() => {
    try {
      const saved = localStorage.getItem('kitchen_dashboard_radio');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_RADIO_STATIONS;
  });

  const [youtubePresets, setYoutubePresets] = useState<YouTubePreset[]>(() => {
    try {
      const saved = localStorage.getItem('kitchen_dashboard_youtube');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_YOUTUBE_PRESETS;
  });

  // Weather State
  const [weather, setWeather] = useState<WeatherCondition | null>(() => {
    try {
      const saved = localStorage.getItem('kitchen_dashboard_weather_cache');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return getDefaultWeatherData(DEFAULT_SETTINGS.tempUnit);
  });
  const [isRefreshingWeather, setIsRefreshingWeather] = useState<boolean>(false);

  // Prayer Times State
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);

  // Online / Offline State
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Night Mode State
  const [isNightModeActive, setIsNightModeActive] = useState<boolean>(false);

  // Active Media Player (mutual exclusivity)
  const [activePlayer, setActivePlayer] = useState<'none' | 'radio' | 'youtube'>('none');

  // Active View Tab: 'calendar', 'tasks', or 'notes'
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks' | 'notes'>('calendar');

  // Modals & Locks
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Child-lock press & hold state
  const [isHoldingGear, setIsHoldingGear] = useState<boolean>(false);
  const [gearHoldProgress, setGearHoldProgress] = useState<number>(0);
  const gearHoldTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('kitchen_dashboard_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('kitchen_dashboard_events', JSON.stringify(events));
    } catch {
      // ignore
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem('kitchen_dashboard_tasks', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('kitchen_dashboard_quick_notes', JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Weather update logic (on mount and every 15 minutes)
  const updateWeather = useCallback(async () => {
    setIsRefreshingWeather(true);
    try {
      const data = await fetchLiveWeather(
        settings.latitude,
        settings.longitude,
        settings.tempUnit
      );
      setWeather(data);
    } catch {
      // fallback to cached or default
    } finally {
      setIsRefreshingWeather(false);
    }
  }, [settings.latitude, settings.longitude, settings.tempUnit]);

  useEffect(() => {
    updateWeather();
    const weatherTimer = setInterval(updateWeather, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(weatherTimer);
  }, [updateWeather]);

  // Prayer times live updates (every 1 second for live countdown)
  const previousPrayerNameRef = useRef<string>('');
  useEffect(() => {
    const updatePrayerTimes = () => {
      const now = new Date();
      const pData = getPrayerTimesForDate(now, settings);
      setPrayerData(pData);

      // Check if night mode should automatically activate based on schedule
      if (settings.nightModeEnabled) {
        const curHour = now.getHours();
        const start = settings.nightModeStartHour; // e.g. 22
        const end = settings.nightModeEndHour; // e.g. 6

        const shouldSleep =
          start > end
            ? curHour >= start || curHour < end
            : curHour >= start && curHour < end;

        // Only auto-trigger night mode if user hasn't manually dismissed it in current session
        // (we respect manual wake)
      }

      // Check for prayer adhan chime transition
      if (settings.prayerChimeAlert && previousPrayerNameRef.current) {
        if (
          previousPrayerNameRef.current !== pData.nextPrayer.name &&
          pData.nextPrayer.remainingSeconds > 86000 // Just entered new prayer
        ) {
          playGentleKitchenChime();
        }
      }
      previousPrayerNameRef.current = pData.nextPrayer.name;
    };

    updatePrayerTimes();
    const timer = setInterval(updatePrayerTimes, 1000);
    return () => clearInterval(timer);
  }, [settings]);

  // Fullscreen toggle for wall-mounted kiosks
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Child-lock button press-and-hold handler
  const startGearHold = () => {
    if (!settings.childLockEnabled) {
      setShowSettingsModal(true);
      return;
    }
    setIsHoldingGear(true);
    setGearHoldProgress(0);

    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds hold to unlock

    gearHoldTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setGearHoldProgress(progress);

      if (elapsed >= duration) {
        if (gearHoldTimerRef.current) clearInterval(gearHoldTimerRef.current);
        setIsHoldingGear(false);
        setGearHoldProgress(0);
        setShowSettingsModal(true);
      }
    }, 50);
  };

  const cancelGearHold = () => {
    if (gearHoldTimerRef.current) {
      clearInterval(gearHoldTimerRef.current);
    }
    setIsHoldingGear(false);
    setGearHoldProgress(0);
  };

  // Event handlers
  const handleAddEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const id = 'evt-' + Date.now().toString(36);
    setEvents((prev) => [
      ...prev,
      {
        ...newEvent,
        id,
      },
    ]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Task handlers
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleAddTask = (newTask: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const id = 'task-' + Date.now().toString(36);
    setTasks((prev) => [
      {
        ...newTask,
        id,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Quick Note handlers
  const handleAddNote = (newNote: Omit<QuickNote, 'id' | 'createdAt'>) => {
    const id = 'note-' + Date.now().toString(36);
    setNotes((prev) => [
      {
        ...newNote,
        id,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEventsCount = events.filter((e) => e.date === todayStr).length;
  const overdueTasksCount = tasks.filter((t) => !t.isCompleted && t.dueDate < todayStr).length;
  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;
  const latestNote = notes.find((n) => n.pinned) || notes[0];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-stone-100 flex flex-col justify-between relative selection:bg-amber-500 selection:text-stone-950">
      {/* Night Mode Screen Saver Overlay */}
      {isNightModeActive && (
        <NightModeOverlay
          use24HourClock={settings.use24HourClock}
          prayerData={prayerData}
          onWake={() => setIsNightModeActive(false)}
        />
      )}

      {/* Main Portrait Appliance Frame */}
      <div className="w-full max-w-[620px] mx-auto flex flex-col flex-1 pb-24 sm:pb-28">
        {/* Subtle Kitchen Appliance Top Status Bar */}
        <header className="px-4 py-2.5 flex items-center justify-between border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <h1 className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Kitchen Hearth
            </h1>
            <span className="text-stone-600">·</span>
            <span className="text-[11px] font-medium text-stone-400">
              {settings.cityName.split(',')[0]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Online / Offline status */}
            {!isOnline ? (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/60">
                <WifiOff className="w-3 h-3" />
                <span>Offline · Using Cache</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <Wifi className="w-3 h-3 text-emerald-500/80" />
              </div>
            )}

            {/* Kiosk Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="touch-btn p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              title="Toggle Fullscreen Kiosk Mode"
              aria-label="Toggle Fullscreen Kiosk Mode"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Child-locked Settings Gear */}
            <div className="relative">
              <button
                onMouseDown={startGearHold}
                onMouseUp={cancelGearHold}
                onMouseLeave={cancelGearHold}
                onTouchStart={startGearHold}
                onTouchEnd={cancelGearHold}
                onClick={() => {
                  if (!settings.childLockEnabled) setShowSettingsModal(true);
                }}
                className={`touch-btn p-1.5 rounded-lg border relative transition-all ${
                  isHoldingGear
                    ? 'bg-amber-500 text-stone-950 border-amber-400 scale-105'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
                title={
                  settings.childLockEnabled
                    ? 'Hold 1.5s to unlock kitchen settings'
                    : 'Open settings'
                }
                aria-label="Settings"
              >
                <Settings className={`w-4 h-4 ${isHoldingGear ? 'animate-spin' : ''}`} />
                {settings.childLockEnabled && (
                  <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
                )}
              </button>

              {/* Progress Tooltip when holding gear button */}
              {isHoldingGear && (
                <div className="absolute right-0 top-10 w-44 p-2 rounded-xl bg-stone-900 border border-amber-500 shadow-2xl text-[11px] text-stone-200 z-50">
                  <div className="font-bold text-amber-400 mb-1">
                    Hold to unlock settings...
                  </div>
                  <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all duration-75"
                      style={{ width: `${gearHoldProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Portrait Content */}
        <main className="flex-1 p-3 sm:p-4 space-y-3.5">
          {/* Main Section 1: Massive Glanceable Kitchen Clock & Weather */}
          <div className="grid grid-cols-1 gap-3.5">
            <div className="kitchen-panel rounded-2xl p-4 sm:p-5">
              <ClockSection
                use24HourClock={settings.use24HourClock}
                onToggleNightMode={() => setIsNightModeActive(!isNightModeActive)}
                isNightMode={isNightModeActive}
              />
            </div>

            <WeatherSection
              weather={weather}
              tempUnit={settings.tempUnit}
              cityName={settings.cityName}
              isRefreshing={isRefreshingWeather}
              onRefresh={updateWeather}
            />
          </div>

          {/* Main Section 2: Muslim Prayer Times Ribbon */}
          <PrayerTimesSection
            prayerData={prayerData}
            prayerChimeEnabled={settings.prayerChimeAlert}
            onToggleChime={() =>
              setSettings((prev) => ({
                ...prev,
                prayerChimeAlert: !prev.prayerChimeAlert,
              }))
            }
          />

          {/* Glanceable Kitchen Scratchpad / Sticky Memo Banner */}
          {latestNote && (
            <button
              onClick={() => setActiveTab('notes')}
              className="touch-btn w-full p-2.5 rounded-xl bg-amber-950/25 hover:bg-amber-950/45 border border-amber-500/40 text-left flex items-center justify-between gap-2.5 transition-all shadow-sm group"
              title="Open kitchen scratchpad"
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <span className="text-amber-400 shrink-0 text-sm">📌</span>
                <span className="text-xs font-bold text-amber-300 shrink-0">
                  Kitchen Memo:
                </span>
                <span className="text-xs text-stone-200 truncate">
                  {latestNote.text ? latestNote.text : 'Finger scribble drawing on board'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-400 group-hover:underline shrink-0 flex items-center gap-1">
                <PenTool className="w-3 h-3" />
                <span>Scratchpad</span>
              </span>
            </button>
          )}

          {/* Main Section 3: Segmented Switch for Calendar, Tasks & Quick Notes */}
          <div className="flex items-center justify-between p-1 rounded-2xl bg-stone-900/90 border border-stone-800 gap-1">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`touch-btn flex-1 min-h-[44px] py-2 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'calendar'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="truncate">Calendar</span>
              {todayEventsCount > 0 && (
                <span
                  className={`text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                    activeTab === 'calendar'
                      ? 'bg-stone-950/20 text-stone-950'
                      : 'bg-stone-800 text-amber-400'
                  }`}
                >
                  {todayEventsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`touch-btn flex-1 min-h-[44px] py-2 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'tasks'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">Tasks</span>
              {overdueTasksCount > 0 ? (
                <span className="text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-600 text-white animate-pulse shrink-0">
                  {overdueTasksCount} overdue
                </span>
              ) : pendingTasksCount > 0 ? (
                <span
                  className={`text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                    activeTab === 'tasks'
                      ? 'bg-stone-950/20 text-stone-950'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {pendingTasksCount}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`touch-btn flex-1 min-h-[44px] py-2 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'notes'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <PenTool className="w-4 h-4 shrink-0" />
              <span className="truncate">Notes</span>
              <span
                className={`text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                  activeTab === 'notes'
                    ? 'bg-stone-950/20 text-stone-950'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                {notes.length}
              </span>
            </button>
          </div>

          {/* Section 4 Viewport Content */}
          <div className="min-h-[460px]">
            {activeTab === 'calendar' ? (
              <CalendarSection
                events={events}
                familyMembers={settings.familyMembers}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onOpenSyncModal={() => setShowGoogleModal(true)}
              />
            ) : activeTab === 'tasks' ? (
              <TasksSection
                tasks={tasks}
                familyMembers={settings.familyMembers}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
              />
            ) : (
              <QuickNotesSection
                notes={notes}
                familyMembers={settings.familyMembers}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePinNote}
              />
            )}
          </div>
        </main>
      </div>

      {/* Fixed Media Player Bar (Pinned at Bottom, Radio & YouTube) */}
      <MediaPlayerBar
        radioStations={radioStations}
        youtubePresets={youtubePresets}
        activePlayer={activePlayer}
        onSetActivePlayer={setActivePlayer}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSaveSettings={(newSettings) => setSettings(newSettings)}
          onClose={() => setShowSettingsModal(false)}
          onSyncGoogleCalendar={() => setShowGoogleModal(true)}
        />
      )}

      {/* Google Calendar Sync Modal */}
      {showGoogleModal && (
        <GoogleCalendarModal
          currentUrl={settings.googleCalendarUrl}
          onSaveUrl={(url) =>
            setSettings((prev) => ({ ...prev, googleCalendarUrl: url }))
          }
          onImportEvents={(imported) => {
            setEvents((prev) => {
              // merge unique by id or title+date
              const existingKeys = new Set(prev.map((e) => `${e.title}_${e.date}`));
              const newItems = imported.filter(
                (e) => !existingKeys.has(`${e.title}_${e.date}`)
              );
              return [...prev, ...newItems];
            });
          }}
          onClose={() => setShowGoogleModal(false)}
        />
      )}
    </div>
  );
}
