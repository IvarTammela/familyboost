import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoryKeys } from '../theme/colors';

const STORAGE_KEY = '@familyboost/state/v1';

const seededChallenges = [
  { id: 'c-1',  title: 'Õhtune jalutuskäik',          category: 'movement', durationMin: 20, source: 'system' },
  { id: 'c-2',  title: 'Söö lõunaks juurvilja',        category: 'healthy-eating', source: 'system' },
  { id: 'c-3',  title: '10 minutit ilma ekraanita',    category: 'self-care', source: 'system' },
  { id: 'c-4',  title: 'Loe 10 lehekülge',             category: 'self-development', source: 'system' },
  { id: 'c-5',  title: 'Kallista pereliiget',          category: 'family-activity', source: 'system' },
  { id: 'c-6',  title: 'Joonista koos lapsega',        category: 'child-activity', source: 'system' },
  { id: 'c-7',  title: 'Saada kaaslasele kena sõnum',  category: 'partner-activity', source: 'system' },
  { id: 'c-8',  title: 'Joo 8 klaasi vett',            category: 'healthy-eating', source: 'system' },
  { id: 'c-9',  title: '15 kätekõverdust',             category: 'movement', source: 'system' },
  { id: 'c-10', title: '5 min meditatsiooni',          category: 'self-care', source: 'system' },
];

const initialState = {
  currentUserId: 'u-2',
  family: {
    id: 'fam-1',
    name: 'Tammela pere',
    inviteCode: 'BOOST-7842',
    members: [
      { id: 'u-1', name: 'Maili', avatar: '👩', role: 'admin' },
      { id: 'u-2', name: 'Ivar',  avatar: '👨', role: 'member' },
      { id: 'u-3', name: 'Laura', avatar: '👧', role: 'member' },
      { id: 'u-4', name: 'Karl',  avatar: '👦', role: 'member' },
    ],
  },
  challenges: seededChallenges,
  today: null, // { date, items: [{ id, challengeId, done }] }
  streaks: {
    'movement': 4,
    'healthy-eating': 6,
    'self-care': 2,
    'self-development': 0,
    'partner-activity': 0,
    'child-activity': 0,
    'family-activity': 0,
  },
  personalGoals: [
    {
      id: 'g-1',
      challengeTitle: 'Sokid pesukorvi',
      category: 'self-care',
      periodDays: 7,
      progressDays: 4,
      reward: 'Šokolaad 🍫',
      status: 'active',
      ownerId: 'u-2',
    },
  ],
  familyChallenges: [
    {
      id: 'fc-1',
      title: 'Pese oma nõud kohe peale sööki',
      periodDays: 7,
      reward: 'Pere SPA-reis 🛁',
      assignedTo: 'all',
      startedAt: '2026-04-13',
      completions: { 'u-1': 5, 'u-2': 5, 'u-3': 5, 'u-4': 3 },
      status: 'active',
    },
  ],
  leaderboard: {
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
  },
};

function pickThreeDaily(challenges) {
  // Pick 3 distinct categories, one challenge per category
  const byCat = {};
  for (const c of challenges) {
    if (!byCat[c.category]) byCat[c.category] = [];
    byCat[c.category].push(c);
  }
  const cats = Object.keys(byCat).filter((k) => byCat[k].length > 0);
  const shuffled = cats.sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((cat, i) => {
    const pool = byCat[cat];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return { id: `t-${Date.now()}-${i}`, challengeId: pick.id, done: false };
  });
}

function ensureToday(state) {
  const today = new Date().toISOString().slice(0, 10);
  if (!state.today || state.today.date !== today) {
    return {
      ...state,
      today: { date: today, items: pickThreeDaily(state.challenges) },
    };
  }
  return state;
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      return ensureToday(action.payload ?? state);
    }
    case 'TOGGLE_TODAY': {
      const items = state.today.items.map((it) =>
        it.id === action.id ? { ...it, done: !it.done } : it
      );
      // Update streak: if a challenge in a category was just completed, bump that streak by 1 once per day
      const toggled = state.today.items.find((i) => i.id === action.id);
      const nowDone = !toggled.done;
      let streaks = state.streaks;
      let leaderboard = state.leaderboard;
      if (nowDone) {
        const ch = state.challenges.find((c) => c.id === toggled.challengeId);
        if (ch) {
          streaks = { ...streaks, [ch.category]: (streaks[ch.category] ?? 0) + 1 };
        }
        leaderboard = {
          ...leaderboard,
          weekly: leaderboard.weekly.map((e) =>
            e.userId === state.currentUserId ? { ...e, completed: e.completed + 1 } : e
          ),
          allTime: leaderboard.allTime.map((e) =>
            e.userId === state.currentUserId ? { ...e, completed: e.completed + 1 } : e
          ),
        };
      }
      return { ...state, today: { ...state.today, items }, streaks, leaderboard };
    }
    case 'ADD_CHALLENGE': {
      return {
        ...state,
        challenges: [
          ...state.challenges,
          {
            id: `c-${Date.now()}`,
            title: action.title,
            category: action.category,
            source: 'custom',
          },
        ],
      };
    }
    case 'ADD_PERSONAL_GOAL': {
      return {
        ...state,
        personalGoals: [
          ...state.personalGoals,
          {
            id: `g-${Date.now()}`,
            challengeTitle: action.challengeTitle,
            category: action.category,
            periodDays: action.periodDays,
            progressDays: 0,
            reward: action.reward,
            status: 'active',
            ownerId: state.currentUserId,
          },
        ],
      };
    }
    case 'ADD_FAMILY_CHALLENGE': {
      const completions = {};
      for (const m of state.family.members) completions[m.id] = 0;
      return {
        ...state,
        familyChallenges: [
          ...state.familyChallenges,
          {
            id: `fc-${Date.now()}`,
            title: action.title,
            periodDays: action.periodDays,
            reward: action.reward,
            assignedTo: action.assignedTo,
            startedAt: new Date().toISOString().slice(0, 10),
            completions,
            status: 'active',
          },
        ],
      };
    }
    case 'REGENERATE_TODAY': {
      return {
        ...state,
        today: {
          date: new Date().toISOString().slice(0, 10),
          items: pickThreeDaily(state.challenges),
        },
      };
    }
    case 'SET_FAMILY': {
      return { ...state, family: action.family };
    }
    case 'RESET': {
      return ensureToday(initialState);
    }
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, ensureToday);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { initialState };
