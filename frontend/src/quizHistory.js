// Lightweight client-side quiz history. No login/backend needed yet --
// this is per-device (browser localStorage), and can later be synced to
// a real account once the login/cloud-sync phase happens. The data shape
// here is deliberately close to what a backend "attempts" table would
// look like, so migrating later is mostly a find-and-replace of the
// storage layer, not the data model.

const STORAGE_KEY = "neet_quiz_history";
const MAX_ENTRIES = 200; // keep localStorage from growing unbounded

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? safeParse(raw, []) : [];
  } catch {
    // localStorage can throw in private-browsing mode or when disabled --
    // fail soft rather than crashing the app.
    return [];
  }
}

/**
 * Saves one completed quiz attempt. Returns the updated history array.
 *
 * @param {object} attempt
 * @param {string} attempt.subject
 * @param {string|null} attempt.chapter
 * @param {number} attempt.totalMarks
 * @param {number} attempt.maxMarks
 * @param {number} attempt.correctCount
 * @param {number} attempt.wrongCount
 * @param {number} attempt.skippedCount
 * @param {number} attempt.totalQuestions
 * @param {number} attempt.timeTakenSec
 * @param {Array}  attempt.topicBreakdown
 */
export function saveAttempt(attempt) {
  const history = getHistory();

  const entry = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    subject: attempt.subject || "General",
    chapter: attempt.chapter || null,
    totalMarks: attempt.totalMarks ?? 0,
    maxMarks: attempt.maxMarks ?? 0,
    correctCount: attempt.correctCount ?? 0,
    wrongCount: attempt.wrongCount ?? 0,
    skippedCount: attempt.skippedCount ?? 0,
    totalQuestions: attempt.totalQuestions ?? 0,
    accuracy: attempt.totalQuestions
      ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
      : 0,
    timeTakenSec: attempt.timeTakenSec ?? null,
    topicBreakdown: attempt.topicBreakdown || [],
  };

  const updated = [entry, ...history].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage full or unavailable -- the in-memory session still works,
    // it just won't persist across reloads. Not worth surfacing to the
    // user mid-quiz.
  }

  return updated;
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** YYYY-MM-DD in the user's local timezone, used for streak/day grouping. */
function toDayKey(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Consecutive-day streak ending today or yesterday (so the streak doesn't
 * reset to 0 the instant midnight passes -- it only breaks once a full day
 * is missed).
 */
export function getStreak(history = getHistory()) {
  if (history.length === 0) return 0;

  const days = new Set(history.map((h) => toDayKey(h.date)));
  const today = new Date();

  let streak = 0;
  let cursor = new Date(today);

  // Allow "today" to be missing (streak still counts from yesterday back)
  if (!days.has(toDayKey(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (days.has(toDayKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getTodayStats(history = getHistory()) {
  const todayKey = toDayKey(new Date().toISOString());
  const todaysAttempts = history.filter((h) => toDayKey(h.date) === todayKey);

  return {
    questionsAttempted: todaysAttempts.reduce(
      (sum, a) => sum + (a.correctCount + a.wrongCount),
      0
    ),
    timeSpentSec: todaysAttempts.reduce(
      (sum, a) => sum + (a.timeTakenSec || 0),
      0
    ),
    quizzesCompleted: todaysAttempts.length,
  };
}

/** Per-subject aggregate accuracy across all saved attempts. */
export function getSubjectStats(history = getHistory()) {
  const stats = {};

  history.forEach((a) => {
    const subject = a.subject || "General";
    stats[subject] = stats[subject] || {
      subject,
      attempts: 0,
      correct: 0,
      wrong: 0,
      totalQuestions: 0,
    };
    stats[subject].attempts += 1;
    stats[subject].correct += a.correctCount;
    stats[subject].wrong += a.wrongCount;
    stats[subject].totalQuestions += a.totalQuestions;
  });

  return Object.values(stats).map((s) => ({
    ...s,
    accuracy:
      s.correct + s.wrong > 0
        ? Math.round((s.correct / (s.correct + s.wrong)) * 100)
        : 0,
  }));
}

/** Aggregate topic accuracy across every attempt, weakest first. */
export function getWeakTopics(history = getHistory()) {
  const stats = {};

  history.forEach((a) => {
    (a.topicBreakdown || []).forEach((t) => {
      stats[t.topic] = stats[t.topic] || {
        topic: t.topic,
        correct: 0,
        wrong: 0,
        skipped: 0,
      };
      stats[t.topic].correct += t.correct || 0;
      stats[t.topic].wrong += t.wrong || 0;
      stats[t.topic].skipped += t.skipped || 0;
    });
  });

  return Object.values(stats)
    .map((s) => ({
      ...s,
      accuracy:
        s.correct + s.wrong > 0
          ? Math.round((s.correct / (s.correct + s.wrong)) * 100)
          : null,
    }))
    .sort((a, b) => (a.accuracy ?? 999) - (b.accuracy ?? 999));
}

export function getRecentActivity(limit = 5, history = getHistory()) {
  return history.slice(0, limit);
}
