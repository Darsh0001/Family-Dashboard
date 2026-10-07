import { CalendarEvent, FamilyMember } from '../types/dashboard';

export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'all', name: 'Whole Family', color: 'bg-amber-500' },
  { id: 'mom', name: 'Mom (Sarah)', color: 'bg-rose-500' },
  { id: 'dad', name: 'Dad (Omar)', color: 'bg-blue-500' },
  { id: 'maya', name: 'Maya', color: 'bg-emerald-500' },
  { id: 'zain', name: 'Zain', color: 'bg-purple-500' },
  { id: 'tariq', name: 'Tariq', color: 'bg-amber-600' },
];

export function getInitialCalendarEvents(): CalendarEvent[] {
  const today = new Date();
  const getOffsetDate = (dayOffset: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'evt-1',
      title: "Maya's Soccer Practice",
      date: getOffsetDate(0), // Today
      startTime: '16:30',
      endTime: '17:45',
      category: 'sports',
      familyMemberId: 'maya',
      location: 'Community Turf Field 3',
      notes: 'Bring shin guards and water bottle',
      isGoogleSync: true,
    },
    {
      id: 'evt-2',
      title: 'Family Dinner: Roasted Lemon Chicken',
      date: getOffsetDate(0), // Today
      startTime: '18:45',
      endTime: '19:45',
      category: 'meal',
      familyMemberId: 'all',
      location: 'Kitchen / Dining Room',
      isGoogleSync: false,
    },
    {
      id: 'evt-3',
      title: 'Zain Pediatric Checkup',
      date: getOffsetDate(1), // Tomorrow
      startTime: '10:15',
      endTime: '11:15',
      category: 'appointment',
      familyMemberId: 'zain',
      location: 'Pediatric Care Clinic',
      notes: 'Immunization record check',
      isGoogleSync: true,
    },
    {
      id: 'evt-4',
      title: 'School STEM Science Fair',
      date: getOffsetDate(2),
      startTime: '13:00',
      endTime: '15:30',
      category: 'school',
      familyMemberId: 'maya',
      location: 'Elementary Auditorium',
      isGoogleSync: true,
    },
    {
      id: 'evt-5',
      title: 'Friday Jummah Prayer',
      date: getOffsetDate(3),
      startTime: '13:15',
      endTime: '14:15',
      category: 'family',
      familyMemberId: 'all',
      location: 'Al-Noor Community Center',
      isGoogleSync: true,
    },
    {
      id: 'evt-6',
      title: 'Tariq Karate Belt Exam',
      date: getOffsetDate(4),
      startTime: '11:00',
      endTime: '12:30',
      category: 'sports',
      familyMemberId: 'tariq',
      location: 'Dojo Center',
      isGoogleSync: false,
    },
    {
      id: 'evt-7',
      title: 'Grocery Run & Farmers Market',
      date: getOffsetDate(5),
      startTime: '09:30',
      endTime: '11:00',
      category: 'family',
      familyMemberId: 'dad',
      location: 'Green Valley Market',
      isGoogleSync: false,
    },
    {
      id: 'evt-8',
      title: 'School Math Olympiad Club',
      date: getOffsetDate(6),
      startTime: '15:30',
      endTime: '16:45',
      category: 'school',
      familyMemberId: 'zain',
      location: 'Room 204',
      isGoogleSync: true,
    },
  ];
}

// Simple robust ICS parser for Google Calendar public feed
export function parseIcsCalendar(icsText: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icsText.split(/\r\n|\n|\r/);
  let currentEvent: Partial<CalendarEvent> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {
        id: 'gc-' + Math.random().toString(36).substring(2, 9),
        category: 'family',
        isGoogleSync: true,
      };
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.title && currentEvent.date) {
        events.push(currentEvent as CalendarEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8).replace(/\\,/g, ',').replace(/\\;/g, ';');
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9).replace(/\\,/g, ',').replace(/\\;/g, ';');
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.notes = line.substring(12).replace(/\\n/g, ' ').replace(/\\,/g, ',');
      } else if (line.startsWith('DTSTART')) {
        const val = line.split(':')[1];
        if (val) {
          // Format: 20261006T143000Z or 20261006
          if (val.length >= 8) {
            const yr = val.substring(0, 4);
            const mo = val.substring(4, 6);
            const dy = val.substring(6, 8);
            currentEvent.date = `${yr}-${mo}-${dy}`;

            if (val.includes('T') && val.length >= 13) {
              const hr = val.substring(9, 11);
              const mn = val.substring(11, 13);
              currentEvent.startTime = `${hr}:${mn}`;
            } else {
              currentEvent.allDay = true;
            }
          }
        }
      } else if (line.startsWith('DTEND')) {
        const val = line.split(':')[1];
        if (val && val.includes('T') && val.length >= 13) {
          const hr = val.substring(9, 11);
          const mn = val.substring(11, 13);
          currentEvent.endTime = `${hr}:${mn}`;
        }
      }
    }
  }

  return events;
}
