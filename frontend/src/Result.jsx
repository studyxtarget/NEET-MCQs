import React from "react";

export default function Result({ result, onRestart }) {
  const {
    totalMarks,
    maxMarks,
    correctCount,
    wrongCount,
    skippedCount,
    totalQuestions,
    marksConfig,
    topicBreakdown,
    timeSummary,
  } = result;

  const marksLabel = marksConfig?.negativeMarking
    ? `(+${marksConfig.correctMarks}/−${marksConfig.negativeMarks})`
    : `(+${marksConfig?.correctMarks ?? 4})`;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-panel border border-border rounded-xl p-8 text-center">
        <div className="text-xs tracking-[3px] text-gold mb-2">RESULT</div>
        <div className="font-mono text-xs text-[#6E9B8D] mb-1">
          TOTAL SCORE
        </div>
        <h2 className="font-display text-4xl text-[#F4EFE0] mb-1">
          {totalMarks}{" "}
          <span className="text-lg text-[#6E9B8D]">
            / {maxMarks} {marksLabel}
          </span>
        </h2>

        <div className="flex justify-center gap-6 mt-6">
          <ScoreStat label="Correct" value={correctCount} color="text-mint" />
          <ScoreStat label="Wrong" value={wrongCount} color="text-rose" />
          <ScoreStat label="Skipped" value={skippedCount} color="text-gold" />
        </div>
      </div>

      {topicBreakdown?.length > 0 && (
        <div className="bg-panel border border-border rounded-xl p-6">
          <div className="text-xs tracking-[2px] text-[#6E9B8D] mb-4">
            ACCURACY BY TOPIC
          </div>
          <div className="space-y-2">
            {topicBreakdown.map((t) => {
              const attempted = t.correct + t.wrong;
              const accuracy = attempted
                ? Math.round((t.correct / attempted) * 100)
                : null;
              const color =
                accuracy === null
                  ? "text-[#6E9B8D]"
                  : accuracy < 50
                  ? "text-rose"
                  : accuracy < 75
                  ? "text-gold"
                  : "text-mint";
              return (
                <div
                  key={t.topic}
                  className="flex justify-between items-center bg-ink/40 rounded px-4 py-2.5 text-sm"
                >
                  <span className="text-[#D8D8CC]">{t.topic}</span>
                  <span className={`font-mono text-xs ${color}`}>
                    {t.correct}✓ {t.wrong}✕ {t.skipped ? `${t.skipped}○` : ""}
                    {"  ·  "}
                    {accuracy === null ? "—" : `${accuracy}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {timeSummary && (
        <div className="bg-panel border border-border rounded-xl p-6">
          <div className="text-xs tracking-[2px] text-[#6E9B8D] mb-4">
            TIME SUMMARY
          </div>
          <div className="space-y-2 text-sm">
            <TimeRow label="Correct answers" value={`${timeSummary.avgCorrectSec}s/q`} />
            <TimeRow label="Wrong answers" value={`${timeSummary.avgWrongSec}s/q`} />
            <TimeRow label="Skipped questions" value={`${timeSummary.avgSkippedSec}s/q`} />
            <TimeRow
              label="Total time taken"
              value={formatDuration(timeSummary.totalTimeSec)}
              emphasize
            />
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        className="w-full bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity"
      >
        Try Another PDF
      </button>
    </div>
  );
}

function ScoreStat({ label, value, color }) {
  return (
    <div>
      <div className={`font-display text-2xl ${color}`}>{value}</div>
      <div className="font-mono text-[10px] tracking-wide text-[#6E9B8D] mt-1">
        {label.toUpperCase()}
      </div>
    </div>
  );
}

function TimeRow({ label, value, emphasize }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#9FC9BE]">{label}</span>
      <span
        className={`font-mono ${emphasize ? "text-[#F4EFE0]" : "text-[#D8D8CC]"}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
