import { RadioStation, YouTubePreset, TaskItem } from '../types/dashboard';

export const INITIAL_RADIO_STATIONS: RadioStation[] = [
  {
    id: 'station-quran',
    name: 'Holy Quran 24/7',
    genre: 'Recitation',
    streamUrl: 'https://qurango.net/radio/tarteel',
    description: 'Continuous beautiful Quranic recitation and reflections',
    logoText: 'قرآن',
  },
  {
    id: 'station-npr',
    name: 'NPR News 24/7',
    genre: 'News & Talk',
    streamUrl: 'https://npr-ice.streamguys1.com/live.mp3',
    description: 'National Public Radio live news updates and stories',
    logoText: 'NPR',
  },
  {
    id: 'station-bbc',
    name: 'BBC World Service',
    genre: 'Global News',
    streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    description: 'International breaking news and cultural broadcasts',
    logoText: 'BBC',
  },
  {
    id: 'station-jazz',
    name: 'Kitchen Jazz & Chill',
    genre: 'Smooth Jazz',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    description: 'Soothing downtempo, ambient groove & culinary cafe vibes',
    logoText: 'JAZZ',
  },
  {
    id: 'station-classical',
    name: 'Calm Kitchen Strings',
    genre: 'Classical & Ambient',
    streamUrl: 'https://ice2.somafm.com/dronezone-128-mp3',
    description: 'Gentle acoustic strings and relaxing atmospheres',
    logoText: 'AIR',
  },
  {
    id: 'station-lofi',
    name: 'Family Lofi Study',
    genre: 'Lo-Fi Chill',
    streamUrl: 'https://ice4.somafm.com/defcon-128-mp3',
    description: 'Mellow beats for cooking, homework, and winding down',
    logoText: 'LOFI',
  },
];

export const INITIAL_YOUTUBE_PRESETS: YouTubePreset[] = [
  {
    id: 'yt-1',
    title: 'Easy 20-Min Family Dinners',
    category: 'cooking',
    videoId: 'q_jA5u9iCkc', // Cooking recipe guide
    duration: '18 min',
  },
  {
    id: 'yt-2',
    title: 'Peaceful Quran Recitation - Surah Rahman',
    category: 'quran',
    videoId: '2S_Z1Z6Z-yE',
    duration: '25 min',
  },
  {
    id: 'yt-3',
    title: 'Cozy Kitchen Hearth & Rain Ambience',
    category: 'ambience',
    videoId: 'CHFif_y2TY8',
    duration: 'Live',
  },
  {
    id: 'yt-4',
    title: 'Fun Kitchen Science for Kids',
    category: 'kids',
    videoId: '4M82WwFzagk',
    duration: '14 min',
  },
  {
    id: 'yt-5',
    title: 'Fresh Artisan Bread in 4 Steps',
    category: 'cooking',
    videoId: 'YX_6l2ZZx_k',
    duration: '12 min',
  },
];

export function getInitialTasks(): TaskItem[] {
  const today = new Date();
  const getOffsetDate = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'task-1',
      title: 'Empty dishwasher & sort kitchen cutlery',
      isCompleted: false,
      dueDate: getOffsetDate(0), // Today
      dueTime: '17:00',
      assignedTo: 'zain',
      category: 'kitchen',
      priority: 'normal',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Take out blue recycling bins to the curb',
      isCompleted: false,
      dueDate: getOffsetDate(-1), // OVERDUE!
      dueTime: '08:00',
      assignedTo: 'tariq',
      category: 'chores',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Buy fresh sourdough, milk & olive oil',
      isCompleted: false,
      dueDate: getOffsetDate(0), // Today
      assignedTo: 'dad',
      category: 'groceries',
      priority: 'normal',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Pack soccer water bottle & cleats bag',
      isCompleted: true,
      dueDate: getOffsetDate(0),
      assignedTo: 'maya',
      category: 'school',
      priority: 'low',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Water the kitchen herb pots (basil & mint)',
      isCompleted: false,
      dueDate: getOffsetDate(0),
      assignedTo: 'maya',
      category: 'chores',
      priority: 'low',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Prep vegetable stock & soak lentils for dinner',
      isCompleted: false,
      dueDate: getOffsetDate(0),
      assignedTo: 'mom',
      category: 'kitchen',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getInitialQuickNotes(): import('../types/dashboard').QuickNote[] {
  return [
    {
      id: 'note-1',
      text: 'Chicken is marinating in the glass bowl in fridge — please don\'t touch, for dinner tonight! 🍋🍗',
      authorId: 'mom',
      color: 'bg-amber-950/40 border-amber-500/50 text-amber-100',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      pinned: true,
    },
    {
      id: 'note-2',
      text: 'Maya: Put the soccer jersey in the dryer so it\'s ready for 4:30 practice! ⚽',
      authorId: 'dad',
      color: 'bg-sky-950/40 border-sky-500/50 text-sky-100',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      pinned: false,
    },
    {
      id: 'note-3',
      text: 'Finished math homework worksheet! Going to backyard to play. ✨',
      authorId: 'zain',
      color: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      pinned: false,
    },
  ];
}
