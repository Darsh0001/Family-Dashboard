import React, { useState } from 'react';
import { CalendarEvent, FamilyMember } from '../types/dashboard';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  X,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface CalendarSectionProps {
  events: CalendarEvent[];
  familyMembers: FamilyMember[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onOpenSyncModal: () => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  events,
  familyMembers,
  onAddEvent,
  onDeleteEvent,
  onOpenSyncModal,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showDayModal, setShowDayModal] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New event form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newStartTime, setNewStartTime] = useState<string>('17:00');
  const [newEndTime, setNewEndTime] = useState<string>('18:00');
  const [newCategory, setNewCategory] = useState<CalendarEvent['category']>('family');
  const [newMemberId, setNewMemberId] = useState<string>('all');
  const [newLocation, setNewLocation] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
    setShowDayModal(true);
    setShowAddForm(false);
  };

  const selectedDateEvents = events.filter((e) => e.date === selectedDateStr);

  const getMember = (id?: string) => {
    return familyMembers.find((m) => m.id === id) || familyMembers[0];
  };

  const handleCreateEvent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    onAddEvent({
      title: newTitle.trim(),
      date: selectedDateStr,
      startTime: newStartTime,
      endTime: newEndTime,
      category: newCategory,
      familyMemberId: newMemberId,
      location: newLocation.trim() || undefined,
      isGoogleSync: false,
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  // Quick preset event suggestions
  const presetEvents = [
    { title: 'Dinner with Family', cat: 'meal', time: '18:30' },
    { title: 'Soccer Practice', cat: 'sports', time: '16:30' },
    { title: 'Grocery Run', cat: 'family', time: '10:00' },
    { title: 'Dentist / Doctor', cat: 'appointment', time: '14:00' },
    { title: 'Quran Class', cat: 'school', time: '17:00' },
    { title: 'Library Study', cat: 'school', time: '15:30' },
  ];

  return (
    <div className="kitchen-panel rounded-2xl p-3 sm:p-4 flex flex-col h-full">
      {/* Month Header & Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-stone-100">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleGoToday}
            className="touch-btn px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700/60"
          >
            Today
          </button>

          <button
            onClick={onOpenSyncModal}
            className="touch-btn px-2 py-1 text-xs font-semibold rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-800/40 flex items-center gap-1"
            title="Google Calendar Integration"
          >
            <span>Google Sync</span>
          </button>

          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={handlePrevMonth}
              className="touch-btn p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="touch-btn p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div
            key={d}
            className={`text-[11px] font-bold uppercase tracking-wider py-1 ${
              i === 0 || i === 6 ? 'text-stone-400' : 'text-stone-300'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1 auto-rows-fr">
        {/* Leading empty cells */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="rounded-xl bg-stone-900/20 border border-stone-800/20 opacity-30 min-h-[46px]"
          />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDateStr;
          const dayEvents = events.filter((e) => e.date === dateStr);

          return (
            <button
              key={`day-${dayNum}`}
              onClick={() => handleDayClick(dayNum)}
              className={`touch-btn relative flex flex-col justify-between p-1.5 rounded-xl border text-left transition-all min-h-[50px] sm:min-h-[56px] ${
                isToday
                  ? 'bg-amber-950/40 border-2 border-amber-400 text-stone-100 shadow-md shadow-amber-950/30'
                  : isSelected
                  ? 'bg-stone-800/90 border-stone-600 text-stone-100'
                  : 'bg-stone-900/70 border-stone-800/70 text-stone-300 hover:bg-stone-800/50'
              }`}
            >
              {/* Day Number and Today indicator */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs sm:text-sm font-bold font-mono tabular-nums leading-none ${
                    isToday ? 'text-amber-300' : 'text-stone-200'
                  }`}
                >
                  {dayNum}
                </span>

                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>

              {/* Event indicators / chips */}
              <div className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                {dayEvents.slice(0, 2).map((evt) => {
                  const member = getMember(evt.familyMemberId);
                  return (
                    <div
                      key={evt.id}
                      className="text-[10px] leading-tight truncate px-1 py-0.5 rounded bg-stone-800/90 border border-stone-700/50 text-stone-300 flex items-center gap-1"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${member.color}`} />
                      <span className="truncate">{evt.title}</span>
                    </div>
                  );
                })}

                {dayEvents.length > 2 && (
                  <div className="text-[9px] font-bold text-amber-400 pl-0.5">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day Events Detail Drawer / Modal */}
      {showDayModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  <span>
                    {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {selectedDateStr === todayStr && (
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                      Today
                    </span>
                  )}
                </h3>
                <span className="text-xs text-stone-400">
                  {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled
                </span>
              </div>

              <button
                onClick={() => setShowDayModal(false)}
                className="touch-btn min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-stone-800 text-stone-300 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2">
              {selectedDateEvents.length === 0 ? (
                <div className="py-8 text-center text-stone-400">
                  <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-stone-600" />
                  <p className="text-sm font-medium">No events for this date</p>
                  <p className="text-xs text-stone-500 mt-1">Tap "Add Event" to schedule something</p>
                </div>
              ) : (
                selectedDateEvents.map((evt) => {
                  const member = getMember(evt.familyMemberId);
                  return (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/70 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${member.color}`} />
                        <div>
                          <div className="text-sm font-bold text-stone-100">{evt.title}</div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-stone-300">
                            {evt.startTime && (
                              <div className="flex items-center gap-1 text-amber-400 font-mono">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}</span>
                              </div>
                            )}
                            <span className="text-stone-400">{member.name}</span>
                          </div>
                          {evt.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-stone-400">
                              <MapPin className="w-3 h-3 text-stone-500" />
                              <span>{evt.location}</span>
                            </div>
                          )}
                          {evt.isGoogleSync && (
                            <div className="mt-1 text-[10px] text-sky-400 font-medium">
                              Google Calendar Synced
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteEvent(evt.id)}
                        className="touch-btn min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-red-400 rounded-lg"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}

              {/* Add Event Form Toggle */}
              {showAddForm ? (
                <form onSubmit={handleCreateEvent} className="mt-4 p-4 rounded-xl bg-stone-800/90 border border-stone-700 space-y-3">
                  <div className="text-sm font-bold text-amber-400">Add New Family Event</div>

                  {/* Title input */}
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Event Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Dinner, Doctor, Soccer"
                      className="w-full px-3 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  {/* Preset quick buttons */}
                  <div>
                    <span className="text-[11px] text-stone-400 block mb-1">Quick Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {presetEvents.map((p) => (
                        <button
                          key={p.title}
                          type="button"
                          onClick={() => {
                            setNewTitle(p.title);
                            setNewStartTime(p.time);
                          }}
                          className="touch-btn px-2.5 py-1 text-xs rounded-md bg-stone-900 border border-stone-700 text-stone-300 hover:bg-stone-700"
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-stone-400 block mb-1">Start Time</label>
                      <input
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-400 block mb-1">End Time</label>
                      <input
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm"
                      />
                    </div>
                  </div>

                  {/* Family member assignee */}
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Family Member</label>
                    <select
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm"
                    >
                      {familyMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="touch-btn flex-1 min-h-[44px] py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm"
                    >
                      Save Event
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="touch-btn px-4 min-h-[44px] py-2.5 rounded-xl bg-stone-700 text-stone-300 font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="touch-btn w-full min-h-[44px] py-3 rounded-xl border-2 border-dashed border-stone-700 hover:border-amber-500/60 text-stone-300 hover:text-amber-400 font-bold text-sm flex items-center justify-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Event for This Day</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
