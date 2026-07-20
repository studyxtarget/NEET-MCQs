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

  // Find Strongest & Weakest Topics
  let strongestTopic = null;
  let weakestTopic = null;

  if (topicBreakdown && topicBreakdown.length > 0) {
    const sorted = [...topicBreakdown].sort((a, b) => {
      const accA = (a.correct + a.wrong) > 0 ? (a.correct / (a.correct + a.wrong)) : -1;
      const accB = (b.correct + b.wrong) > 0 ? (b.correct / (b.correct + b.wrong)) : -1;
      return accB - accA;
    });

    if (sorted[0] && (sorted[0].correct + sorted[0].wrong) > 0) {
      strongestTopic = sorted[0].topic;
    }
    const last = sorted[sorted.length - 1];
    if (last && (last.correct + last.wrong) > 0) {
      weakestTopic = last.topic;
    }
  }

  // Circular SVG Properties
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePct / 100) * circumference;

  // Motivational Badge Logic
  const getMotivationalBadge = () => {
    if (scorePct >= 85) {
      return { 
        title: "🏆 Excellent Performance!", 
        badgeBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", 
        msg: "Outstanding work! You've mastered this set." 
      };
    }
    if (scorePct >= 70) {
      return { 
        title: "🥇 Great Job!", 
        badgeBg: "bg-amber-500/20 text-amber-400 border-amber-500/40", 
        msg: "Solid command over concepts! A little fine-tuning will lead to 100%." 
      };
    }
    if (scorePct >= 50) {
      return { 
        title: "👍 Good Attempt!", 
        badgeBg: "bg-blue-500/20 text-blue-400 border-blue-500/40", 
        msg: "Good effort! Review missed questions to plug your weak spots." 
      };
    }
    return { 
      title: "📘 Keep Practicing!", 
      badgeBg: "bg-rose-500/20 text-rose-400 border-rose-500/40", 
      msg: "Don't stop now! Revisit weak topics and attempt again." 
    };
  };

  const badgeInfo = getMotivationalBadge();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Quiz Result',
        text: `I scored ${totalMarks}/${maxMarks} (${scorePct}%) with ${accuracyPct}% accuracy!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`I scored ${totalMarks}/${maxMarks} (${scorePct}%) with ${accuracyPct}% accuracy!`);
      alert("Result copied to clipboard!");
    }
  };

  const marksLabel = marksConfig?.negativeMarking
    ? `(+${marksConfig.correctMarks}/−${marksConfig.negativeMarks})`
    : `(+${marksConfig?.correctMarks ?? 4})`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-[#F4EFE0] pb-10">
      
      {/* 1. HERO SECTION WITH CIRCULAR METER + PERCENTAGE */}
      <div className="bg-panel border border-border rounded-2xl p-6 md:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest border border-gold/30 bg-gold/10 text-gold">
          ✨ Quiz Performance Analysis
        </div>

        {/* Circular Progress Bar */}
        <div className="flex justify-center items-center my-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="text-ink/80"
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
              <span className="text-xs font-mono font-bold text-gold mt-1">
                {scorePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="space-y-1.5">
          <h3 className={`inline-block px-4 py-1 rounded-xl text-sm font-mono font-bold border ${badgeInfo.badgeBg}`}>
            {badgeInfo.title}
          </h3>
          <p className="text-sm text-[#D8D8CC] font-sans max-w-md mx-auto">{badgeInfo.msg}</p>
        </div>
      </div>

      {/* 2. STATS & ACCURACY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="🟢" label="Correct" value={correctCount} color="text-emerald-400 border-emerald-500/30 bg-emerald-500/10" />
        <StatCard icon="🔴" label="Wrong" value={wrongCount} color="text-rose-400 border-rose-500/30 bg-rose-500/10" />
        <StatCard icon="🟡" label="Skipped" value={skippedCount} color="text-amber-400 border-amber-500/30 bg-amber-500/10" />
        <StatCard icon="📊" label="Accuracy" value={`${accuracyPct}%`} color="text-gold border-gold/30 bg-gold/10" />
      </div>

      {/* 3. STRONGEST & WEAKEST TOPIC SUMMARY CARD */}
      {(strongestTopic || weakestTopic) && (
        <div className="bg-panel border border-border rounded-2xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {strongestTopic && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5">
              <span className="text-2xl">💪</span>
              <div className="text-xs">
                <span className="font-mono text-emerald-400 font-bold uppercase block mb-0.5">Strongest Topic</span>
                <span className="text-white font-medium text-sm">{strongestTopic}</span>
              </div>
            </div>
          )}
          {weakestTopic && (
            <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5">
              <span className="text-2xl">🎯</span>
              <div className="text-xs">
                <span className="font-mono text-rose-400 font-bold uppercase block mb-0.5">Needs Improvement</span>
                <span className="text-white font-medium text-sm">{weakestTopic}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TOPIC BREAKDOWN PROGRESS BARS */}
      {topicBreakdown?.length > 0 && (
        <div className="bg-panel border border-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="text-xs font-mono tracking-[2px] text-[#6E9B8D] font-bold uppercase">
            🧠 Accuracy By Topic
          </div>
          <div className="space-y-4">
            {topicBreakdown.map((t) => {
              const attempted = t.correct + t.wrong;
              const topicAccuracy = attempted ? Math.round((t.correct / attempted) * 100) : null;
              
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
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-gray-400">
                        {t.correct}✓ {t.wrong}✕ {t.skipped ? `${t.skipped}○` : ""}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${badgeColor}`}>
                        {statusText}
                      </span>
                      <span className="text-white font-semibold min-w-[32px] text-right">
                        {topicAccuracy === null ? "—" : `${topicAccuracy}%`}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-ink/80 rounded-full overflow-hidden border border-border/50">
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

      {/* 5. TIME SUMMARY WITH ICONS */}
      {timeSummary && (
        <div className="bg-panel border border-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="text-xs font-mono tracking-[2px] text-[#6E9B8D] font-bold uppercase">
            ⏱ Time Summary
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <TimeCard label="Correct Time" value={`${timeSummary.avgCorrectSec || 0}s / q`} icon="⏱" />
            <TimeCard label="Wrong Time" value={`${timeSummary.avgWrongSec || 0}s / q`} icon="❌" />
            <TimeCard label="Skipped Time" value={`${timeSummary.avgSkippedSec || 0}s / q`} icon="⏭" />
            <TimeCard label="Total Time" value={formatDuration(timeSummary.totalTimeSec || 0)} icon="🕒" highlight />
          </div>
        </div>
      )}

      {/* 6. ACTION BUTTONS + SHARE BUTTON */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRestart}
          className="flex-1 bg-gold text-ink font-mono text-base font-bold tracking-wide rounded-xl py-4 shadow-xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>Try Another PDF</span>
        </button>

        <button
          onClick={handleShare}
          className="bg-panel border border-border text-gray-200 hover:text-white hover:bg-ink/60 font-mono text-base font-bold rounded-xl px-5 py-4 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span>📤</span>
          <span>Share</span>
        </button>
        
        {onReview && (
          <button
            onClick={onReview}
            className="flex-1 bg-panel border border-gold/40 text-gold hover:bg-gold/10 font-mono text-base font-bold tracking-wide rounded-xl py-4 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            <span>Review</span>
          </button>
        )}

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="sm:w-auto px-6 bg-panel border border-border text-gray-300 hover:text-white hover:bg-ink/40 font-mono text-base font-bold rounded-xl py-4 transition-all"
          >
            🏠
          </button>
        )}
      </div>

    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`border rounded-xl p-3.5 text-center ${color} shadow-md`}>
      <div className="text-base mb-0.5">{icon}</div>
      <div className="text-2xl font-display font-bold">{value}</div>
      <div className="font-mono text-[10px] tracking-wider uppercase opacity-80 mt-0.5">{label}</div>
    </div>
  );
}

function TimeCard({ label, value, icon, highlight }) {
  return (
    <div className={`p-3.5 rounded-xl border text-center ${highlight ? "bg-ink/80 border-gold/50 shadow-lg" : "bg-ink/40 border-border"}`}>
      <div className="text-xs font-mono text-[#6E9B8D] mb-1 flex items-center justify-center gap-1.5">
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
