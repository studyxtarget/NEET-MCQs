import React from "react";

export default function Result({ result, onRestart }) {
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

  // Calculate Accuracy
  const attemptedCount = correctCount + wrongCount;
  const accuracyPct = attemptedCount > 0 
    ? Math.round((correctCount / attemptedCount) * 100) 
    : 0;

  // Calculate Score Percentage for SVG Circular Progress
  const scorePct = maxMarks > 0 ? Math.max(0, Math.min(100, Math.round((totalMarks / maxMarks) * 100))) : 0;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePct / 100) * circumference;

  // Motivational Message based on Score % & Accuracy
  const getMotivationalMessage = () => {
    if (scorePct >= 85) return { title: "Outstanding Performance! 🎉", sub: "You've mastered this set. Keep up the brilliant streak!" };
    if (scorePct >= 70) return { title: "Great Job! 🚀", sub: "Strong command over the concepts. A little fine-tuning and you'll hit 100%!" };
    if (scorePct >= 50) return { title: "Good Effort! 👍", sub: "You're on the right track. Review the missed questions to sharpen your weak spots." };
    return { title: "Keep Practicing! 💪", sub: "Don't get discouraged. Re-visit the key concepts and attempt again to improve!" };
  };

  const message = getMotivationalMessage();

  const marksLabel = marksConfig?.negativeMarking
    ? `(+${marksConfig.correctMarks}/−${marksConfig.negativeMarks})`
    : `(+${marksConfig?.correctMarks ?? 4})`;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-[#F4EFE0]">
      
      {/* 1. Motivational Banner */}
      <div className="bg-panel border border-border rounded-xl p-5 text-center">
        <h3 className="text-xl font-display text-gold mb-1">{message.title}</h3>
        <p className="text-sm text-[#D8D8CC] font-sans">{message.sub}</p>
      </div>

      {/* 2. Score Hero Section (Circular Progress + Accuracy Card) */}
      <div className="bg-panel border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Big Circular Score */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-ink/60"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-gold transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="font-display text-3xl text-white">{totalMarks}</span>
              <span className="text-xs font-mono text-[#6E9B8D] border-t border-border/50 pt-0.5 mt-0.5">
                / {maxMarks}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono tracking-widest text-[#6E9B8D] mt-2">TOTAL SCORE {marksLabel}</span>
        </div>

        {/* Accuracy & Breakdown Overview */}
        <div className="flex-1 w-full space-y-4">
          <div className="bg-ink/40 border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono tracking-wider text-[#6E9B8D]">ACCURACY RATE</div>
              <div className="text-2xl font-display text-white mt-0.5">{accuracyPct}%</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Correct" value={correctCount} color="border-emerald-500/40 text-emerald-400 bg-emerald-500/10" icon="🟢" />
            <StatBox label="Wrong" value={wrongCount} color="border-rose-500/40 text-rose-400 bg-rose-500/10" icon="🔴" />
            <StatBox label="Skipped" value={skippedCount} color="border-gray-500/40 text-gray-300 bg-gray-500/10" icon="⚪" />
          </div>
        </div>
      </div>

      {/* 3. Overall Performance Progress Bar */}
      <div className="bg-panel border border-border rounded-xl p-6">
        <div className="flex justify-between items-center text-xs font-mono tracking-wider text-[#6E9B8D] mb-3">
          <span>QUESTION DISTRIBUTION</span>
          <span>{totalQuestions} TOTAL QUESTIONS</span>
        </div>

        {/* Stacked Bar */}
        <div className="h-3 w-full bg-ink/60 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-border">
          <div
            style={{ width: `${(correctCount / totalQuestions) * 100}%` }}
            className="bg-emerald-500 h-full rounded-l-full transition-all"
            title={`Correct: ${correctCount}`}
          />
          <div
            style={{ width: `${(wrongCount / totalQuestions) * 100}%` }}
            className="bg-rose-500 h-full transition-all"
            title={`Wrong: ${wrongCount}`}
          />
          <div
            style={{ width: `${(skippedCount / totalQuestions) * 100}%` }}
            className="bg-gray-500 h-full rounded-r-full transition-all"
            title={`Skipped: ${skippedCount}`}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-gray-400 mt-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {correctCount} Correct</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> {wrongCount} Wrong</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500"></span> {skippedCount} Skipped</span>
        </div>
      </div>

      {/* 4. Topic Performance Bars */}
      {topicBreakdown?.length > 0 && (
        <div className="bg-panel border border-border rounded-xl p-6">
          <div className="text-xs font-mono tracking-[2px] text-[#6E9B8D] mb-4">
            🧠 TOPIC PERFORMANCE
          </div>
          <div className="space-y-4">
            {topicBreakdown.map((t) => {
              const attempted = t.correct + t.wrong;
              const topicTotal = attempted + (t.skipped || 0);
              const accuracy = attempted ? Math.round((t.correct / attempted) * 100) : null;
              
              const barColor = accuracy === null 
                ? "bg-gray-500" 
                : accuracy < 50 
                ? "bg-rose-500" 
                : accuracy < 75 
                ? "bg-amber-400" 
                : "bg-emerald-500";

              return (
                <div key={t.topic} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#F4EFE0] font-medium">{t.topic}</span>
                    <span className="font-mono text-xs text-gray-400">
                      {t.correct}✓ {t.wrong}✕ {t.skipped ? `${t.skipped}○` : ""} 
                      <span className="ml-2 text-white font-semibold">
                        {accuracy === null ? "—" : `${accuracy}%`}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-ink/60 rounded-full overflow-hidden border border-border/50">
                    <div
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${accuracy ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Time Analysis Cards */}
      {timeSummary && (
        <div className="bg-panel border border-border rounded-xl p-6">
          <div className="text-xs font-mono tracking-[2px] text-[#6E9B8D] mb-4">
            ⏱ TIME ANALYSIS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <TimeCard label="Avg. Time (Correct)" value={`${timeSummary.avgCorrectSec || 0}s / question`} icon="⚡" />
            <TimeCard label="Avg. Time (Wrong)" value={`${timeSummary.avgWrongSec || 0}s / question`} icon="⚠️" />
            <TimeCard label="Avg. Time (Skipped)" value={`${timeSummary.avgSkippedSec || 0}s / question`} icon="⏸️" />
            <TimeCard label="Total Time Spent" value={formatDuration(timeSummary.totalTimeSec || 0)} icon="⌛" highlight />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onRestart}
        className="w-full bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity font-semibold shadow-lg"
      >
        🚀 Attempt Another Quiz
      </button>
    </div>
  );
}

function StatBox({ label, value, color, icon }) {
  return (
    <div className={`border rounded-lg p-2.5 text-center ${color}`}>
      <div className="text-xs">{icon}</div>
      <div className="text-lg font-display my-0.5">{value}</div>
      <div className="font-mono text-[9px] tracking-wider uppercase opacity-80">{label}</div>
    </div>
  );
}

function TimeCard({ label, value, icon, highlight }) {
  return (
    <div className={`p-3 rounded-lg border ${highlight ? "bg-ink/80 border-gold/40" : "bg-ink/40 border-border"}`}>
      <div className="flex items-center gap-2 text-xs font-mono text-[#6E9B8D] mb-1">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-sm font-mono font-medium ${highlight ? "text-gold" : "text-[#F4EFE0]"}`}>
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
                
