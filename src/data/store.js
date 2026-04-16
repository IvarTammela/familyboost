import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@familyboost/state/v2';

// ────────────────── Points & levels ──────────────────
export const POINTS = {
  daily: 10,
  goalDay: 15,
  familyDay: 20,
  assignedComplete: 25,  // to completer
  assignedBonus: 10,     // to assigner
  allDailyDone: 30,      // bonus when all 3 today are done
  goalAchieved: 100,     // completing full personal goal
  familyGoalAchieved: 200, // per member when family challenge completes
};

const LEVELS = [
  { level: 1, min: 0,    title: 'Alustaja' },
  { level: 2, min: 100,  title: 'Harjutaja' },
  { level: 3, min: 250,  title: 'Hoogu koguv' },
  { level: 4, min: 500,  title: 'Sihikindel' },
  { level: 5, min: 900,  title: 'Kindel' },
  { level: 6, min: 1500, title: 'Meister' },
  { level: 7, min: 2500, title: 'Pere pealik' },
  { level: 8, min: 4000, title: 'Legend' },
];

export function computeLevel(points) {
  let current = LEVELS[0];
  let next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const progressInLevel = next ? (points - current.min) / (next.min - current.min) : 1;
  return {
    ...current,
    points,
    next,
    progressPct: Math.min(100, Math.max(0, Math.round(progressInLevel * 100))),
    pointsToNext: next ? next.min - points : 0,
  };
}

// ────────────────── Seed data ──────────────────
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

const today0 = new Date().toISOString().slice(0, 10);

const initialState = {
  currentUserId: 'u-2',
  family: {
    id: 'fam-1',
    name: 'Tammela pere',
    inviteCode: 'BOOST-7842',
    members: [
      { id: 'u-1', name: 'Maili', role: 'admin' },
      { id: 'u-2', name: 'Ivar',  role: 'member' },
      { id: 'u-3', name: 'Laura', role: 'member' },
      { id: 'u-4', name: 'Karl',  role: 'member' },
    ],
  },
  points: {
    'u-1': 820,
    'u-2': 650,
    'u-3': 340,
    'u-4': 180,
  },
  dailyBonusAwarded: null, // ISO date string of last day bonus awarded
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
      reward: 'Šokolaad',
      status: 'active',
      ownerId: 'u-2',
      lastMarkedDate: null,
    },
  ],
  familyChallenges: [
    {
      id: 'fc-1',
      title: 'Pese oma nõud kohe peale sööki',
      periodDays: 7,
      reward: 'Pere SPA-reis',
      assignedTo: 'all',
      startedAt: '2026-04-13',
      completions: { 'u-1': 5, 'u-2': 5, 'u-3': 5, 'u-4': 3 },
      lastMarkedBy: {}, // { userId: isoDate }
      status: 'active',
    },
  ],
  memberAssignments: [
    // { id, assignerId, assigneeId, title, category, date, done }
  ],
  leaderboard: {
    // Counts of completed challenges, used as a simple "activity" stat
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

function addPoints(state, userId, delta) {
  return {
    ...state,
    points: { ...state.points, [userId]: Math.max(0, (state.points[userId] ?? 0) + delta) },
  };
}

function maybeAwardDailyBonus(state) {
  const today = state.today;
  if (!today || today.items.length === 0) return state;
  const allDone = today.items.every((i) => i.done);
  const alreadyAwarded = state.dailyBonusAwarded === today.date;
  if (allDone && !alreadyAwarded) {
    let next = addPoints(state, state.currentUserId, POINTS.allDailyDone);
    next = { ...next, dailyBonusAwarded: today.date };
    return next;
  }
  if (!allDone && state.dailyBonusAwarded === today.date) {
    // user unchecked something → revoke bonus
    let next = addPoints(state, state.currentUserId, -POINTS.allDailyDone);
    next = { ...next, dailyBonusAwarded: null };
    return next;
  }
  return state;
}

function updateLeaderboard(state, userId, delta) {
  return {
    ...state,
    leaderboard: {
      ...state.leaderboard,
      weekly: state.leaderboard.weekly.map((e) =>
        e.userId === userId ? { ...e, completed: Math.max(0, e.completed + delta) } : e
      ),
      allTime: state.leaderboard.allTime.map((e) =>
        e.userId === userId ? { ...e, completed: Math.max(0, e.completed + delta) } : e
      ),
    },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      // Merge saved state with initial state to preserve new fields added after install
      const merged = { ...initialState, ...(action.payload ?? {}) };
      return ensureToday(merged);
    }

    case 'TOGGLE_TODAY': {
      const toggled = state.today.items.find((i) => i.id === action.id);
      const nowDone = !toggled.done;
      const items = state.today.items.map((it) =>
        it.id === action.id ? { ...it, done: !it.done } : it
      );

      let next = { ...state, today: { ...state.today, items } };
      const ch = state.challenges.find((c) => c.id === toggled.challengeId);
      const delta = nowDone ? 1 : -1;

      // streaks
      if (ch) {
        next = {
          ...next,
          streaks: {
            ...next.streaks,
            [ch.category]: Math.max(0, (next.streaks[ch.category] ?? 0) + delta),
          },
        };
      }
      // leaderboard counts
      next = updateLeaderboard(next, state.currentUserId, delta);
      // points
      next = addPoints(next, state.currentUserId, delta * POINTS.daily);
      // daily bonus
      next = maybeAwardDailyBonus(next);
      return next;
    }

    case 'MARK_GOAL_DAY': {
      const today = new Date().toISOString().slice(0, 10);
      const goal = state.personalGoals.find((g) => g.id === action.id);
      if (!goal || goal.lastMarkedDate === today || goal.status !== 'active') return state;

      const newProgress = goal.progressDays + 1;
      const achieved = newProgress >= goal.periodDays;

      const personalGoals = state.personalGoals.map((g) =>
        g.id === action.id
          ? { ...g, progressDays: newProgress, lastMarkedDate: today, status: achieved ? 'achieved' : 'active' }
          : g
      );

      let next = { ...state, personalGoals };
      next = addPoints(next, state.currentUserId, POINTS.goalDay);
      if (achieved) next = addPoints(next, state.currentUserId, POINTS.goalAchieved);
      return next;
    }

    case 'MARK_FAMILY_DAY': {
      const today = new Date().toISOString().slice(0, 10);
      const userId = state.currentUserId;
      const fc = state.familyChallenges.find((f) => f.id === action.id);
      if (!fc || fc.status !== 'active') return state;
      if (fc.lastMarkedBy?.[userId] === today) return state;

      const newCompletions = {
        ...fc.completions,
        [userId]: (fc.completions[userId] ?? 0) + 1,
      };
      const everyoneDone = state.family.members.every(
        (m) => (newCompletions[m.id] ?? 0) >= fc.periodDays
      );

      const familyChallenges = state.familyChallenges.map((f) =>
        f.id === action.id
          ? {
              ...f,
              completions: newCompletions,
              lastMarkedBy: { ...f.lastMarkedBy, [userId]: today },
              status: everyoneDone ? 'achieved' : 'active',
            }
          : f
      );

      let next = { ...state, familyChallenges };
      next = addPoints(next, userId, POINTS.familyDay);
      if (everyoneDone) {
        // Reward every member
        for (const m of state.family.members) {
          next = addPoints(next, m.id, POINTS.familyGoalAchieved);
        }
      }
      return next;
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
            lastMarkedDate: null,
          },
        ],
      };
    }

    case 'ADD_FAMILY_CHALLENGE': {
      const completions = {};
      const lastMarkedBy = {};
      for (const m of state.family.members) {
        completions[m.id] = 0;
      }
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
            lastMarkedBy,
            status: 'active',
          },
        ],
      };
    }

    case 'ASSIGN_TO_MEMBER': {
      const today = new Date().toISOString().slice(0, 10);
      // Rule: one assignment per day per assigner->assignee pair
      const exists = state.memberAssignments.some(
        (a) =>
          a.assignerId === state.currentUserId &&
          a.assigneeId === action.assigneeId &&
          a.date === today
      );
      if (exists) return state;
      return {
        ...state,
        memberAssignments: [
          ...state.memberAssignments,
          {
            id: `a-${Date.now()}`,
            assignerId: state.currentUserId,
            assigneeId: action.assigneeId,
            title: action.title,
            category: action.category,
            date: today,
            done: false,
          },
        ],
      };
    }

    case 'COMPLETE_ASSIGNMENT': {
      const a = state.memberAssignments.find((x) => x.id === action.id);
      if (!a || a.done) return state;
      const memberAssignments = state.memberAssignments.map((x) =>
        x.id === action.id ? { ...x, done: true } : x
      );
      let next = { ...state, memberAssignments };
      next = addPoints(next, a.assigneeId, POINTS.assignedComplete);
      next = addPoints(next, a.assignerId, POINTS.assignedBonus);
      next = updateLeaderboard(next, a.assigneeId, 1);
      return next;
    }

    case 'REGENERATE_TODAY': {
      return {
        ...state,
        today: {
          date: new Date().toISOString().slice(0, 10),
          items: pickThreeDaily(state.challenges),
        },
        dailyBonusAwarded: null,
      };
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

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      } catch (e) {}
    })();
  }, []);

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
