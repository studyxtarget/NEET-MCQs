import React, { useState } from "react";

export default function Instructions({ quizData, onStart }) {
  const { questions, mode, subject, chapter, settings = {} } = quizData;
  const {
    timerEnabled = false,
    totalSeconds = null,
    negativeMarking = false,
    correctMarks = 4,
    negativeMarks = 1,
  } = settings;

  const [acknowledged, setAcknowledged] = useState(false);
  const totalMinutes = totalSeconds ? Math.round(totalSeconds / 60) : null;

  return (
    <div className="max-w-lg mx-auto bg-panel border border-border rounded-xl p-8">
      <div className="text-xs tracking-[3px] text-gold mb-2">STEP 2</div>
      <h2 className="font-display text-2xl text-[#F0F2F0] mb-6">
        Before you start
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <InfoCard icon="📚" label="Subject" value={subject || "General"} />
        <InfoCard icon="📖" label="Chapter" value={chapter || "Not specified"} />
        <InfoCard icon="❓" label="Questions" value={questions.length} />
        <InfoCard
          icon="⏱"
          label="Total Time"
          value={timerEnabled ? `${totalMinutes} min` : "No limit"}
        />
        <InfoCard icon="➕" label="Correct" value={`+${correctMarks}`} />
        <InfoCard
          icon="➖"
          label="Incorrect"
          value={negativeMarking ? `−${negativeMarks}` : "No penalty"}
        />
      </div>

      <div className="flex items-center gap-2 text-xs tracking-[2px] text-[#6B7873] mb-3">
        <span>📌</span> IMPORTANT INSTRUCTIONS
      </div>
      <ul className="space-y-2 text-sm text-[#E4E7E4] mb-6">
        <li className="flex gap-2">
          <span className="text-gold">·</span>
          Each question has exactly one correct option.
        </li>
        <li className="flex gap-2">
          <span className="text-gold">·</span>
          Tapping an option locks it in — you'll see the right answer and a
          short explanation right after.
        </li>
        <li className="flex gap-2">
          <span className="text-gold">·</span>
          Use "Skip" if you don't want to attempt a question. Skipped
          questions score zero — no penalty.
        </li>
        {negativeMarking && (
          <li className="flex gap-2">
            <span className="text-gold">·</span>
            Wrong answers deduct {negativeMarks} mark
            {negativeMarks === 1 ? "" : "s"} each.
          </li>
        )}
        {timerEnabled && (
          <li className="flex gap-2">
            <span className="text-gold">·</span>
            You have {totalMinutes} minute{totalMinutes === 1 ? "" : "s"} for
            the whole quiz. It auto-submits when time runs out, so pace
            yourself.
          </li>
        )}
        <li className="flex gap-2">
          <span className="text-gold">·</span>
          Once you tap "Start Exam" below, the timer (if enabled) begins
          immediately.
        </li>
      </ul>

      <label className="flex items-start gap-3 text-sm text-[#E4E7E4] cursor-pointer mb-6 select-none">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-0.5"
        />
        <span>I have read all instructions</span>
      </label>

      <button
        onClick={onStart}
        disabled={!acknowledged}
        className="w-full bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        🚀 Start Exam
      </button>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-ink/40 border border-border rounded-lg px-4 py-3">
      <div className="font-mono text-[10px] tracking-wide text-[#6B7873] mb-1">
        {icon} {label.toUpperCase()}
      </div>
      <div className="text-[#F0F2F0] text-sm font-medium truncate">
        {value}
      </div>
    </div>
  );
}
