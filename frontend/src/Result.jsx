import React from "react";

export default function Result({ result, onRestart, onReview, onGoHome }) {
  const {
    totalMarks = 0,
    maxMarks = 0,
    correctCount = 0,
    wrongCount = 0,
    skippedCount = 0,
    totalQuestions = 0,
    marksConfig = {},
    topicBreakdown = [],
    timeSummary = null,
  } = result;

  // 1. Calculations & Metrics
  const attemptedCount = correctCount + wrongCount;
  const accuracyPct = attemptedCount > 0 
    ? Math.round((correctCount / attemptedCount) * 100) 
    : 0;

  const scorePct = maxMarks > 0 
    ? Math.max(0, Math.min(100, Math.round((totalMarks / maxMarks) * 100))) 
    : 0;

  // Circular SVG Properties
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePct / 100) * circumference;

  // Motivational Message Logic
  const getMotivationalBadge = () => {
    if (scorePct >= 80) {
      return { label: "EXCELLENT!", badgeBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", msg: "Outstanding performance! You've mastered this set." };
    }
    if (scorePct >= 60) {
      return { label: "GOOD JOB!", badgeBg: "bg-amber-500/20 text-amber-400 border-amber-500/40", msg: "Great effort! A quick review will push you to the top." };
    }
    return { label: "KEEP PRACTICING!", badgeBg: "bg-rose-500/20 text-rose-400 border-rose-500/40", msg: "Don't stop now! Identify weak topics and try again." };
  };

  const badgeInfo = getMotivationalBadge();

  const marksLabel = marksConfig?.negativeMarking
    ? `(+${marksConfig.correctMarks}/−${marksConfig.negativeMarks})`
    : `(+${marksConfig?.correctMarks ?? 4})`;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-[#F4EFE0]">
      
      {/* 1. TOP HERO SECTION */}
      <div className="bg-panel border border-border rounded-xl p-6 md:p-8 text-center space-y-4 relative overflow-hidden shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest border border-gold/30 bg-gold/10 text-gold mb-1">
          🏆 Quiz Completed
        </div>

        {/* Big Circular Score */}
        <div className="flex justify-center items-center my-4">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="text-ink/60"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="text-gold transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="font-display text-4xl text-white font-bold">{totalMarks}</span>
              <span className="text-xs font-mono text-[#6E9B8D] border-t border-border/60 pt-0.5 mt-0.5">
                / {maxMarks} {marksLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="space-y-1.5">
          <span className={`inline-block px-3 py-0.5 rounded text-xs font-mono font-bold border ${badgeInfo.badgeBg}`}>
            {badgeInfo.label}
          </span>
          <p className="text-sm text-[#D8D8CC] font-sans">{badgeInfo.msg}</p>
        </div>
      </div>

      {/* 2. STATISTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="🟢" label="Correct" value={correctCount} color="text-emerald-400 border-emerald-500/30 bg-emerald-500/10" />
        <StatCard icon="🔴" label="Wrong" value={wrongCount} color="text-rose-400 border-rose-500/30 bg-rose-500/10" />
        <StatCard icon="🟡" label="Skipped" value={skippedCount} color="text-amber-400 border-amber-500/30 bg-amber-500/10" />
        <StatCard icon="📈" label="Accuracy" value={`${accuracyPct}%`} color="text-gold border-gold/30 bg-gold/10" />
      </div>

      {/* 3. TOPIC PERFORMANCE */}
      {topicBreakdown?.length > 0 && (
        <div className="bg-panel border border-border rounded-xl p-6 shadow-md">
          <div className="text-xs font-mono tracking-[2px] text-[#6E9B8D] mb-4 font-semibold uppercase">
            🧠 Topic Performance Breakdown
          </div>
          <div className="space-y-4">
            {topicBreakdown.map((t) => {
              const attempted = t.correct + t.wrong;
              const topicAccuracy = attempted ? Math.round((t.correct / attempted) * 100) : null;
              
              // Color Rules: Weak (Red <50%), Average (Yellow 50-74%), Strong (Green >=75%)
              let barColor = "bg-gray-500";
              let badgeColor = "text-gray-400 border-gray-500/30 bg-gray-500/10";
              let statusText = "Untested";

              if (topicAccuracy !== null) {
                if (topicAccuracy >= 75) {
                  barColor = "bg-emerald-500";
                  badgeColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
                  statusText = "Strong";
                } else if (topicAccuracy >= 50) {
                  barColor = "bg-amber-400";
                  badgeColor = "text-amber-400 border-amber-500/30 bg-amber-500/10";
                  statusText = "Average";
                } else {
                  barColor = "bg-rose-500";
                  badgeColor = "text-rose-400 border-rose-500/30 bg-rose-500/10";
                  statusText = "Weak";
                }
              }

              return (
                <div key={t.topic} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#F4EFE0] font-medium">{t.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
                        {statusText}
                      </span>
                      <span className="font-mono text-xs text-gray-300 font-semibold">
                        {topicAccuracy === null ? "—" : `${topicAccuracy}%`}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-ink/60 rounded-full overflow-hidden border border-border/50">
                    <div
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${topicAccuracy ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TIME ANALYSIS */}
      {timeSummary && (
        <div className="bg-panel border border-border rounded-xl p-6 shadow-md">
          <div className="text-xs font-mono tracking-[2px] text-[#6E9B8D] mb-4 font-semibold uppercase">
            ⏱ Time Analysis
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <TimeCard label="Avg Correct" value={`${timeSummary.avgCorrectSec || 0}s`} icon="⚡" />
            <TimeCard label="Avg Wrong" value={`${timeSummary.avgWrongSec || 0}s`} icon="⚠️" />
            <TimeCard label="Avg Skipped" value={`${timeSummary.avgSkippedSec || 0}s`} icon="⏸️" />
            <TimeCard label="Total Time" value={formatDuration(timeSummary.totalTimeSec || 0)} icon="⌛" highlight />
          </div>
        </div>
      )}

      {/* 5. ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRestart}
          className="flex-1 bg-gold text-ink font-mono text-sm tracking-wide rounded-lg py-3 hover:opacity-90 transition-opacity font-bold shadow-lg"
        >
          📄 Try Another PDF
        </button>
        
        {onReview && (
          <button
            onClick={onReview}
            className="flex-1 bg-panel border border-gold/40 text-gold hover:bg-gold/10 font-mono text-sm tracking-wide rounded-lg py-3 transition-colors font-bold"
          >
            🔍 Review Answers
          </button>
        )}

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="sm:w-auto px-5 bg-panel border border-border text-gray-300 hover:text-white hover:bg-ink/40 font-mono text-sm tracking-wide rounded-lg py-3 transition-colors"
          >
            🏠 Home
          </button>
        )}
      </div>

    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`border rounded-xl p-3 text-center ${color} shadow-sm`}>
      <div className="text-base mb-1">{icon}</div>
      <div className="text-xl font-display font-bold">{value}</div>
      <div className="font-mono text-[10px] tracking-wider uppercase opacity-80 mt-0.5">{label}</div>
    </div>
  );
}

function TimeCard({ label, value, icon, highlight }) {
  return (
    <div className={`p-3 rounded-lg border text-center ${highlight ? "bg-ink/80 border-gold/50" : "bg-ink/40 border-border"}`}>
      <div className="text-xs font-mono text-[#6E9B8D] mb-1 flex items-center justify-center gap-1">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-sm font-mono font-bold ${highlight ? "text-gold" : "text-[#F4EFE0]"}`}>
        {value}
      </div>
    </div>
  );
}

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
      }
