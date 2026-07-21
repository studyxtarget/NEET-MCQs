import React, { useEffect, useState } from "react";
import { analyzeDocument, generateQuiz } from "./api";

const SUBJECTS = ["Biology", "Physics", "Chemistry"];

export default function TopicSelect({ docInfo, onQuizReady, onBack }) {
  const [status, setStatus] = useState("analyzing"); // analyzing | ready | generating | error
  const [errorMsg, setErrorMsg] = useState("");
  const [analysis, setAnalysis] = useState(null); // { subject, chapter, topics }
  const [selected, setSelected] = useState(() => new Set());

  const [subject, setSubject] = useState("Biology");
  const [chapter, setChapter] = useState("");
  const [numQuestions, setNumQuestions] = useState(15);
  const [difficulty, setDifficulty] = useState("medium");
  const [mode, setMode] = useState("extract_existing");

  const [timerEnabled, setTimerEnabled] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(numQuestions);
  const [minutesTouched, setMinutesTouched] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [correctMarks, setCorrectMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);

  useEffect(() => {
    if (!minutesTouched) setTotalMinutes(numQuestions);
  }, [numQuestions, minutesTouched]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await analyzeDocument({ docId: docInfo.doc_id });
        if (cancelled) return;
        setAnalysis(result);
        setSubject(
          SUBJECTS.includes(result.subject) ? result.subject : "Biology"
        );
        setChapter(result.chapter || "");
        setSelected(new Set(result.topics.map((t) => t.name)));
        if (docInfo.filename.toLowerCase().includes("pyq")) {
          setMode("extract_existing");
        }
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err.message);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [docInfo]);

  const toggleTopic = (name) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const selectAll = () =>
    setSelected(new Set(analysis.topics.map((t) => t.name)));
  const deselectAll = () => setSelected(new Set());

  const selectedCoverage = analysis
    ? analysis.topics
        .filter((t) => selected.has(t.name))
        .reduce((sum, t) => sum + t.coverage, 0)
    : 0;

  // Transparent, simple heuristic -- not a precise prediction, just gives
  // the person a rough sense of how much material they've selected.
  const estimatedCapacity = Math.max(4, Math.round((selectedCoverage / 100) * 40));

  const handleGenerate = async () => {
    setStatus("generating");
    setErrorMsg("");
    try {
      const quiz = await generateQuiz({
        docId: docInfo.doc_id,
        subject,
        chapter,
        topics: Array.from(selected),
        numQuestions,
        difficulty,
        mode,
      });
      onQuizReady({
        ...quiz,
        subject,
        chapter: chapter || null,
        settings: {
          timerEnabled,
          totalSeconds: timerEnabled ? Number(totalMinutes) * 60 : null,
          negativeMarking,
          correctMarks: Number(correctMarks) || 0,
          negativeMarks: negativeMarking ? Number(negativeMarks) || 0 : 0,
        },
      });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  if (status === "analyzing") {
    return (
      <div className="max-w-3xl mx-auto bg-panel border border-border rounded-2xl p-10 text-center">
        <div className="text-4xl mb-4 animate-pulse">🧠</div>
        <div className="text-[#F4EFE0] font-display text-xl mb-2">
          Analyzing your PDF…
        </div>
        <p className="text-sm text-[#9FC9BE]">
          Detecting subject, chapter, and topics.
        </p>
      </div>
    );
  }

  if (status === "error" && !analysis) {
    return (
      <div className="max-w-3xl mx-auto bg-panel border border-border rounded-2xl p-8 space-y-4">
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
          {errorMsg}
        </p>
        <button
          onClick={onBack}
          className="w-full border border-border text-[#9FC9BE] rounded-xl py-3 text-sm"
        >
          ← Upload a different PDF
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-panel border border-border rounded-2xl p-8 md:p-10 shadow-2xl space-y-6">
      <div>
        <div className="text-xs tracking-[3px] text-gold mb-2 font-mono font-semibold uppercase">
          STEP 2
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-[#F4EFE0]">
          Detected topics
        </h2>
      </div>

      {status === "error" && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
          {errorMsg}
        </p>
      )}

      {/* Subject & Chapter */}
      <div className="bg-ink/40 border border-border rounded-xl p-5 space-y-4">
        <div className="text-xs tracking-[2px] text-[#6E9B8D] font-mono font-semibold uppercase">
          📘 Subject & Chapter
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#9FC9BE] block mb-1.5 font-medium">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-ink border border-border rounded-xl px-3 py-2.5 text-sm text-[#EDEDE3] outline-none"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#9FC9BE] block mb-1.5 font-medium">
              Chapter
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full bg-ink border border-border rounded-xl px-3 py-2.5 text-sm text-[#EDEDE3] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Detected topics */}
      <div className="bg-ink/40 border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs tracking-[2px] text-[#6E9B8D] font-mono font-semibold uppercase">
            🧬 Topics found
          </div>
          <div className="flex gap-3 text-xs font-mono">
            <button onClick={selectAll} className="text-gold">
              Select all
            </button>
            <button onClick={deselectAll} className="text-[#6E9B8D]">
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {analysis.topics.map((t) => {
            const isSelected = selected.has(t.name);
            return (
              <label
                key={t.name}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-gold bg-gold/10"
                    : "border-border bg-ink/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleTopic(t.name)}
                  className="accent-gold"
                />
                <span className="flex-1 text-sm text-[#EDEDE3]">
                  {t.name}
                </span>
                <span className="text-xs font-mono text-[#6E9B8D]">
                  {t.coverage}%
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-border/40">
          <span className="text-[#9FC9BE]">Estimated MCQ capacity</span>
          <span className="text-gold">≈ {estimatedCapacity} questions</span>
        </div>
      </div>

      {/* Quiz settings */}
      <div className="bg-ink/40 border border-border rounded-xl p-5 space-y-4">
        <div className="text-xs tracking-[2px] text-[#6E9B8D] font-mono font-semibold uppercase">
          ⚙️ Quiz Settings
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#9FC9BE] block mb-1.5 font-medium">
              Questions
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full bg-ink border border-border rounded-xl px-3 py-2.5 text-sm text-[#EDEDE3] outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-[#9FC9BE] block mb-1.5 font-medium">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-ink border border-border rounded-xl px-3 py-2.5 text-sm text-[#EDEDE3] outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#9FC9BE] block mb-2 font-medium">
            Mode
          </label>
          <div className="flex flex-wrap gap-4 text-sm text-[#EDEDE3]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                checked={mode === "extract_existing"}
                onChange={() => setMode("extract_existing")}
                className="accent-gold"
              />
              Existing PYQs in PDF
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                checked={mode === "generate_new"}
                onChange={() => setMode("generate_new")}
                className="accent-gold"
              />
              Generate new MCQs
            </label>
          </div>
        </div>
      </div>

      {/* Exam settings */}
      <div className="bg-ink/40 border border-border rounded-xl p-5 space-y-4">
        <div className="text-xs tracking-[2px] text-[#6E9B8D] font-mono font-semibold uppercase">
          📝 Exam Settings
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-[#EDEDE3] flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={timerEnabled}
              onChange={(e) => setTimerEnabled(e.target.checked)}
              className="accent-gold rounded"
            />
            Timer for whole quiz
          </label>
          {timerEnabled && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={300}
                value={totalMinutes}
                onChange={(e) => {
                  setMinutesTouched(true);
                  setTotalMinutes(Number(e.target.value));
                }}
                className="w-20 bg-ink border border-border rounded-xl px-3 py-1.5 text-sm text-[#EDEDE3] outline-none text-center font-mono"
              />
              <span className="text-xs text-[#6E9B8D] font-mono">min</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <label className="text-sm text-[#EDEDE3] flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={negativeMarking}
              onChange={(e) => setNegativeMarking(e.target.checked)}
              className="accent-gold rounded"
            />
            Negative marking
          </label>
          {negativeMarking && (
            <div className="flex items-center gap-2 text-xs text-[#6E9B8D] font-mono">
              <span>+</span>
              <input
                type="number"
                min={0}
                max={10}
                value={correctMarks}
                onChange={(e) => setCorrectMarks(e.target.value)}
                className="w-14 bg-ink border border-border rounded-xl px-2 py-1.5 text-sm text-[#EDEDE3] outline-none text-center"
              />
              <span>/ −</span>
              <input
                type="number"
                min={0}
                max={10}
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(e.target.value)}
                className="w-14 bg-ink border border-border rounded-xl px-2 py-1.5 text-sm text-[#EDEDE3] outline-none text-center"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-border text-[#9FC9BE] rounded-xl py-3.5 text-sm"
        >
          ← Back
        </button>
        <button
          onClick={handleGenerate}
          disabled={selected.size === 0 || status === "generating"}
          className="flex-[2] bg-gold text-ink font-mono text-base font-bold tracking-wide rounded-xl py-3.5 shadow-xl disabled:bg-gray-600 disabled:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "generating" ? "⏳ Generating…" : "🚀 Generate Quiz"}
        </button>
      </div>
    </div>
  );
}
