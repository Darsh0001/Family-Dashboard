import React, { useState } from 'react';
import { AppSettings, FamilyMember } from '../types/dashboard';
import {
  X,
  MapPin,
  Clock,
  Compass,
  Moon,
  Users,
  Calendar,
  Lock,
  Unlock,
  Save,
  RotateCcw,
} from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
  onSyncGoogleCalendar: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  onSyncGoogleCalendar,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'location' | 'prayer' | 'night' | 'calendar' | 'family'>('location');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Common city presets for instant 1-tap setup
  const cityPresets = [
    { name: 'New York, USA', lat: 40.7128, lng: -74.006, method: 'NorthAmerica' as const },
    { name: 'Chicago, USA', lat: 41.8781, lng: -87.6298, method: 'NorthAmerica' as const },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278, method: 'MuslimWorldLeague' as const },
    { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832, method: 'NorthAmerica' as const },
    { name: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437, method: 'NorthAmerica' as const },
    { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, method: 'Dubai' as const },
    { name: 'Dallas, USA', lat: 32.7767, lng: -96.797, method: 'NorthAmerica' as const },
  ];

  const handleApplyCityPreset = (preset: typeof cityPresets[0]) => {
    setFormData((prev) => ({
      ...prev,
      cityName: preset.name,
      latitude: preset.lat,
      longitude: preset.lng,
      prayerCalculationMethod: preset.method,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                Kitchen Appliance Settings
              </h2>
              <span className="text-xs text-stone-400">
                Child-protected configuration panel
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="touch-btn min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-stone-800 text-stone-400 hover:text-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2 border-b border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-stone-950/40">
          <button
            onClick={() => setActiveTab('location')}
            className={`touch-btn min-h-[38px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
              activeTab === 'location'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Location & Weather
          </button>
          <button
            onClick={() => setActiveTab('prayer')}
            className={`touch-btn min-h-[38px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
              activeTab === 'prayer'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Prayer Times
          </button>
          <button
            onClick={() => setActiveTab('night')}
            className={`touch-btn min-h-[38px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
              activeTab === 'night'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" /> Night Dim Schedule
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`touch-btn min-h-[38px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
              activeTab === 'calendar'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Google Calendar
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`touch-btn min-h-[38px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
              activeTab === 'family'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Family
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          {/* Location & Weather Tab */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={formData.cityName}
                  onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Chicago, IL"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-xs text-stone-400 block mb-1.5">Quick Location Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {cityPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyCityPreset(preset)}
                      className="touch-btn px-2.5 py-1 text-xs rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-amber-300"
                    >
                      {preset.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Latitude and Longitude */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-sm"
                  />
                </div>
              </div>

              {/* Temperature Unit & Clock Format */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Temperature Unit</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tempUnit: 'F' })}
                      className={`touch-btn flex-1 py-2 rounded-xl text-xs font-bold border ${
                        formData.tempUnit === 'F'
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-950 border-stone-700 text-stone-400'
                      }`}
                    >
                      °F (Fahrenheit)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tempUnit: 'C' })}
                      className={`touch-btn flex-1 py-2 rounded-xl text-xs font-bold border ${
                        formData.tempUnit === 'C'
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-950 border-stone-700 text-stone-400'
                      }`}
                    >
                      °C (Celsius)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Time Format</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, use24HourClock: false })}
                      className={`touch-btn flex-1 py-2 rounded-xl text-xs font-bold border ${
                        !formData.use24HourClock
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-950 border-stone-700 text-stone-400'
                      }`}
                    >
                      12-Hour (AM/PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, use24HourClock: true })}
                      className={`touch-btn flex-1 py-2 rounded-xl text-xs font-bold border ${
                        formData.use24HourClock
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-950 border-stone-700 text-stone-400'
                      }`}
                    >
                      24-Hour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prayer Tab */}
          {activeTab === 'prayer' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Calculation Method
                </label>
                <select
                  value={formData.prayerCalculationMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prayerCalculationMethod: e.target.value as AppSettings['prayerCalculationMethod'],
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-sm"
                >
                  <option value="NorthAmerica">ISNA (Islamic Society of North America)</option>
                  <option value="MuslimWorldLeague">Muslim World League (MWL - Europe/Global)</option>
                  <option value="Egyptian">Egyptian General Authority of Survey</option>
                  <option value="UmmAlQura">Umm Al-Qura University (Makkah, Saudi Arabia)</option>
                  <option value="Karachi">University of Islamic Sciences, Karachi</option>
                  <option value="Dubai">Dubai Awqaf (UAE)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Asr Juristic Method (Madhab)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, asrMadhab: 'Shafi' })}
                    className={`touch-btn py-2.5 rounded-xl text-xs font-bold border ${
                      formData.asrMadhab === 'Shafi'
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-stone-950 border-stone-700 text-stone-400'
                    }`}
                  >
                    Standard (Shafi, Maliki, Hanbali)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, asrMadhab: 'Hanafi' })}
                    className={`touch-btn py-2.5 rounded-xl text-xs font-bold border ${
                      formData.asrMadhab === 'Hanafi'
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-stone-950 border-stone-700 text-stone-400'
                    }`}
                  >
                    Hanafi (Later Asr)
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-950 border border-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.prayerChimeAlert}
                    onChange={(e) => setFormData({ ...formData, prayerChimeAlert: e.target.checked })}
                    className="w-5 h-5 rounded text-amber-500 accent-amber-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-stone-100 block">
                      Gentle Kitchen Chime on Prayer Time
                    </span>
                    <span className="text-xs text-stone-400">
                      Plays a peaceful soft chime when a prayer begins
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Night Dim Schedule Tab */}
          {activeTab === 'night' && (
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-950 border border-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.nightModeEnabled}
                  onChange={(e) => setFormData({ ...formData, nightModeEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-amber-500 accent-amber-500"
                />
                <div>
                  <span className="text-sm font-bold text-stone-100 block">
                    Automatic Night Dimming
                  </span>
                  <span className="text-xs text-stone-400">
                    Dims screen to a calm dark night clock during late kitchen hours
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Dim Starts At</label>
                  <select
                    value={formData.nightModeStartHour}
                    onChange={(e) =>
                      setFormData({ ...formData, nightModeStartHour: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-sm"
                  >
                    {[20, 21, 22, 23].map((hr) => (
                      <option key={hr} value={hr}>
                        {hr}:00 ({hr > 12 ? `${hr - 12} PM` : `${hr} PM`})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Wake Screen At</label>
                  <select
                    value={formData.nightModeEndHour}
                    onChange={(e) =>
                      setFormData({ ...formData, nightModeEndHour: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-sm"
                  >
                    {[5, 6, 7, 8].map((hr) => (
                      <option key={hr} value={hr}>
                        0{hr}:00 ({hr} AM)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Google Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Google Calendar Public iCal URL
                </label>
                <input
                  type="url"
                  value={formData.googleCalendarUrl}
                  onChange={(e) => setFormData({ ...formData, googleCalendarUrl: e.target.value })}
                  placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  In Google Calendar: Settings &gt; Integrate calendar &gt; Copy "Public address in iCal format".
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSyncGoogleCalendar}
                  className="touch-btn w-full min-h-[44px] py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Sync Google Calendar Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Family Members Tab */}
          {activeTab === 'family' && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Family Profiles:
              </span>
              <div className="space-y-2">
                {formData.familyMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-stone-950 border border-stone-800"
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${member.color}`} />
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...formData.familyMembers];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, familyMembers: updated });
                      }}
                      className="flex-1 bg-transparent text-sm text-stone-100 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="touch-btn min-h-[44px] px-4 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="touch-btn min-h-[44px] px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saveSuccess ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
