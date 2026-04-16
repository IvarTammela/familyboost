// Temporary mock data — will be replaced with PocketBase API
export const mockFamily = {
  id: 'fam-1',
  name: 'Tammela Family',
  inviteCode: 'BOOST-7842',
  members: [
    { id: 'u-1', name: 'Maili', avatar: '👩', role: 'admin' },
    { id: 'u-2', name: 'Ivar', avatar: '👨', role: 'member' },
    { id: 'u-3', name: 'Laura', avatar: '👧', role: 'member' },
    { id: 'u-4', name: 'Karl', avatar: '👦', role: 'member' },
  ],
};

export const currentUserId = 'u-2'; // Ivar

export const seededChallenges = [
  { id: 'c-1', title: 'Evening walk', category: 'movement', durationMin: 20 },
  { id: 'c-2', title: 'Eat a vegetable with lunch', category: 'healthy-eating' },
  { id: 'c-3', title: '10-min screen-free time', category: 'self-care' },
  { id: 'c-4', title: 'Read 10 pages', category: 'self-development' },
  { id: 'c-5', title: 'Hug a family member', category: 'family-activity' },
  { id: 'c-6', title: 'Make a drawing with my child', category: 'child-activity' },
  { id: 'c-7', title: 'Text my partner something kind', category: 'partner-activity' },
  { id: 'c-8', title: 'Drink 8 glasses of water', category: 'healthy-eating' },
  { id: 'c-9', title: '15 push-ups', category: 'movement' },
  { id: 'c-10', title: '5 min meditation', category: 'self-care' },
];

export const mockToday = {
  date: new Date().toISOString().slice(0, 10),
  items: [
    { id: 't-1', challengeId: 'c-1', done: false },
    { id: 't-2', challengeId: 'c-2', done: true },
    { id: 't-3', challengeId: 'c-3', done: false },
  ],
};

export const mockStreaks = {
  'movement': 4,
  'healthy-eating': 6,
  'self-care': 2,
  'self-development': 0,
};

export const mockPersonalGoals = [
  {
    id: 'g-1',
    challengeTitle: 'Put socks in laundry basket',
    category: 'self-care',
    periodDays: 7,
    progressDays: 4,
    reward: 'Chocolate 🍫',
    status: 'active',
    ownerId: 'u-2',
  },
];

export const mockFamilyChallenges = [
  {
    id: 'fc-1',
    title: 'Wash dishes right after eating',
    periodDays: 7,
    reward: 'Family SPA trip 🛁',
    assignedTo: 'all', // or array of memberIds
    startedAt: '2026-04-13',
    completions: {
      'u-1': 5,
      'u-2': 5,
      'u-3': 5,
      'u-4': 3,
    },
    status: 'active',
  },
];

export const mockLeaderboard = {
  weekly: [
    { userId: 'u-1', completed: 18 },
    { userId: 'u-2', completed: 15 },
    { userId: 'u-3', completed: 10 },
    { userId: 'u-4', completed: 6 },
  ],
  allTime: [
    { userId: 'u-1', completed: 142 },
    { userId: 'u-2', completed: 128 },
    { userId: 'u-3', completed: 87 },
    { userId: 'u-4', completed: 54 },
  ],
};
