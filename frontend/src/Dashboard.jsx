import React from "react";
import {
  getHistory,
  getStreak,
  getSubjectStats,
  getWeakTopics,
  getTodayStats,
  getRecentActivity,
} from "./quizHistory";

export default function Dashboard() {
  const history = getHistory();
  if (history.length === 0) return null; // nothing to show a first-time user

  const streak = getStreak(history);
  const subjectStats = getSubjectStats(history);
  const weakTopics = getWeakTopics(history).slice(0, 3);
  const today = getTodayStats(history);
  const [recent] = getRecentActivity(1, history);

  return (
    <div className="mb-12 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Daily streak */}
        <div className="bg-panel border border-border rounded-2xl p-5">
          <div className="text-xs tracking-wide text-[#9FC9BE] mb-1">
            🔥 DAILY STREAK
          </div>
          <div className="font-display text-3xl text-[#F4EFE0]">
            {streak} {streak === 1 ? "day" : "days"}
          </div>
        </div>

        {/* Most recent quiz */}
        {recent && (
          <div className="bg-panel border border-border rounded-2xl p-5">
            <div className="text-xs tracking-wide text-[#9FC9BE] mb-1">
              📚 RECENT QUIZ
            </div>
            <div className="font-display text-lg text-[#F4EFE0] truncate">
              {recent.chapter || recent.subject}
            </div>
            <div className="text-sm text-gold mt-0.5">
              {recent.accuracy}% accuracy
            </div>
          </div>
        )}
      </div>

      {/* Subject accuracy */}
      {subjectStats.length > 0 && (
        <div className="bg-panel border border-border rounded-2xl p-5">
          <div className="text-xs tracking-wide text-[#9FC9BE] mb-4">
            📊 SUBJECT ACCURACY
          </div>
          <div className="space-y-3">
            {subjectStats.map((s) => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#EDEDE3]">{s.subject}</span>
                  <span className={accuracyColor(s.accuracy)}>
                    {s.accuracy}%
                  </span>
                </div>
                <div className="h-1.5 bg-ink rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${accuracyBar(s.accuracy)}`}
                    style={{ width: `${s.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Weak topics */}
        {weakTopics.length > 0 && (
          <div className="bg-panel border border-border rounded-2xl p-5">
            <div className="text-xs tracking-wide text-[#9FC9BE] mb-3">
              🧠 WEAK TOPICS
            </div>
            <ul className="space-y-2 text-sm text-[#EDEDE3]">
              {weakTopics.map((t) => (
                <li key={t.topic} className="flex justify-between">
                  <span>• {t.topic}</span>
                  <span className={accuracyColor(t.accuracy)}>
                    {t.accuracy === null ? "—" : `${t.accuracy}%`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Today's progress */}
        <div className="bg-panel border border-border rounded-2xl p-5">
          <div className="text-xs tracking-wide text-[#9FC9BE] mb-3">
            ⏱ TODAY'S PROGRESS
          </div>
          <div className="flex justify-between text-sm text-[#EDEDE3]">
            <span>Questions</span>
            <span className="font-mono">{today.questionsAttempted}</span>
          </div>
          <div className="flex justify-between text-sm text-[#EDEDE3] mt-1.5">
            <span>Time</span>
            <span className="font-mono">
              {formatDuration(today.timeSpentSec)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function accuracyColor(pct) {
  if (pct === null || pct === undefined) return "text-[#6E9B8D]";
  if (pct < 50) return "text-rose";
  if (pct < 75) return "text-gold";
  return "text-mint";
}

function accuracyBar(pct) {
  if (pct < 50) return "bg-rose";
  if (pct < 75) return "bg-gold";
  return "bg-mint";
}

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${totalSeconds}s`;
}
