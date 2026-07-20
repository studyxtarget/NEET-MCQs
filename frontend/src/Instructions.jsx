import React, { useState, useEffect } from "react";

const MODE_LABELS = {
  extract_existing: "Previous Year Questions",
  generate_new: "AI Generated Questions",
};

export default function Instructions({ quizData, user, onStart }) {
  const { questions = [], mode, subject, chapter, settings = {} } = quizData;
  const {
    timerEnabled = false,
    totalSeconds = null,
    negativeMarking = false,
    correctMarks = 4,
    negativeMarks = 1,
    passingAccuracy = "60%",
  } = settings;

  const [acknowledged, setAcknowledged] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
          ", " +
          now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalMinutes = totalSeconds ? Math.round(totalSeconds / 60) : null;
  const totalMarks = questions.length * correctMarks;
  const userName = user?.name || "Guest User";
  
  // Format mode string safely
  const formattedMode = MODE_LABELS[mode] || mode || "AI Generated Questions";

  return (
    <div className="max-w-2xl mx-auto bg-panel border border-border rounded-xl p-6 md:p-8 text-[#F4EFE0]">
      {/* 1. Candidate Information Header */}
      <div className="bg-ink/60 border border-border rounded-lg p-4 mb-6">
        <div className="text-xs tracking-[2px] text-[#6E9B8D] mb-3 font-mono font-semibold">
          👤 CANDIDATE INFORMATION
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gold">👤</span>
            <span className="text-gray-400">Candidate:</span>
            <span className="font-medium text-white">{userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gold">📚</span>
            <span className="text-gray-400">Subject:</span>
            <span className="font-medium text-white">{subject || "General"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gold">📖</span>
            <span className="text-gray-400">Chapter:</span>
            <span className="font-medium text-white">{chapter || "General"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gold">🕒</span>
            <span className="text-gray-400">Date & Time:</span>
            <span className="font-medium text-white">{currentDateTime}</span>
          </div>
        </div>
      </div>

      <div className="text-xs tracking-[3px] text-gold mb-1">STEP 2</div>
      <h2 className="font-display text-2xl text-[#F4EFE0] mb-6">
        Exam Instructions
      </h2>

      {/* 2. Exam Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <InfoCard icon="❓" label="Total Questions" value={questions.length} />
        <InfoCard icon="🎯" label="Total Marks" value={totalMarks} />
        <InfoCard
          icon="⏱"
          label="Total Time"
          value={timerEnabled ? `${totalMinutes} min` : "No limit"}
        />
        <InfoCard
          icon="➖"
          label="Negative Marking"
          value={negativeMarking ? `-${negativeMarks} Mark` : "No penalty"}
        />
        <InfoCard icon="⚙️" label="Mode" value={formattedMode} />
        <InfoCard icon="📈" label="Passing Accuracy" value={passingAccuracy} />
      </div>

      {/* 3. Instructions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs tracking-[2px] text-[#6E9B8D] mb-3 font-mono font-semibold">
          📌 IMPORTANT INSTRUCTIONS
        </div>
        <ul className="space-y-2.5 text-sm text-[#D8D8CC]">
          <li className="flex gap-2">
            <span className="text-gold">·</span>
            You can change your answer until the quiz is submitted.
          </li>
          <li className="flex gap-2">
            <span className="text-gold">·</span>
            Use the question palette to jump between questions.
          </li>
          <li className="flex gap-2">
            <span className="text-gold">·</span>
            Questions not attempted will be treated as skipped.
          </li>
          <li className="flex gap-2">
            <span className="text-gold">·</span>
            The quiz auto-submits when time expires.
          </li>
          <li className="flex gap-2">
            <span className="text-gold">·</span>
            After submission, answers become read-only.
          </li>
        </ul>
      </div>

      {/* 4. Legend Section */}
      <div className="mb-6 border-t border-b border-border py-4">
        <div className="text-xs tracking-[2px] text-[#6E9B8D] mb-3 font-mono font-semibold">
          🎨 QUESTION PALETTE LEGEND
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-500 inline-block"></span>
            <span>Not Visited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
            <span>Marked for Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span>Wrong (after submit)</span>
          </div>
        </div>
      </div>

      {/* Checkbox */}
      <label className="flex items-start gap-3 text-sm text-[#EDEDE3] cursor-pointer mb-4 select-none">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-0.5"
        />
        <span>I have read all instructions carefully and am ready to proceed.</span>
      </label>

      {/* 5. Start Button with Warning */}
      <div className="space-y-2 mb-6">
        {timerEnabled && (
          <blockquote className="text-xs text-amber-400/90 bg-amber-500/10 border-l-2 border-amber-400 p-2 rounded-r">
            ⚠️ Once the exam starts, the timer cannot be paused.
          </blockquote>
        )}
        <button
          onClick={onStart}
          disabled={!acknowledged}
          className="w-full bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
        >
          🚀 Start Exam
        </button>
      </div>

      {/* 6. Footer */}
      <div className="text-center text-xs text-[#6E9B8D] italic border-t border-border/50 pt-4">
        Good luck! Read every question carefully before submitting.
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-ink/40 border border-border rounded-lg px-3 py-2.5">
      <div className="font-mono text-[10px] tracking-wide text-[#6E9B8D] mb-0.5">
        {icon} {label.toUpperCase()}
      </div>
      <div className="text-[#F4EFE0] text-sm font-medium truncate">
        {value}
      </div>
    </div>
  );
        }
      
