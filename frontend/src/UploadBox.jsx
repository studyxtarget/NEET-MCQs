import React, { useEffect, useState } from "react";
import { uploadPdf, generateQuiz } from "./api";

const SUBJECTS = ["Biology", "Physics", "Chemistry"];

export default function UploadBox({ onQuizReady }) {
  const [file, setFile] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
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

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!minutesTouched) setTotalMinutes(numQuestions);
  }, [numQuestions, minutesTouched]);

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setStatus("uploading");
    setErrorMsg("");
    try {
      const info = await uploadPdf(selected);
      setDocInfo(info);
      if (info.filename.toLowerCase().includes("pyq")) {
        setMode("extract_existing");
      }
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  const handleGenerate = async () => {
    if (!docInfo) return;
    setStatus("generating");
    setErrorMsg("");
    try {
      const quiz = await generateQuiz({
        docId: docInfo.doc_id,
        subject,
        chapter,
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

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <div className="font-mono text-[10px] tracking-[3px] text-gold mb-2">
        STEP 1
      </div>
      <h2 className="font-display text-[28px] text-[#F0F2F0] mb-7">
        Upload your PDF
      </h2>

      <label
        htmlFor="pdf-upload"
        className={`block rounded-2xl py-9 px-6 text-center cursor-pointer transition-colors mb-6 ${
          file
            ? "bg-card border border-gold/40"
            : "border border-dashed border-[#333B38] hover:border-gold/60"
        }`}
      >
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-[#8A9490] text-sm">
          {file ? file.name : "Choose a PDF — NCERT chapter, notes, or PYQ bank"}
        </div>
      </label>

      {status === "uploading" && (
        <p className="text-sm text-[#8A9490] mb-4">Extracting text…</p>
      )}
      {status === "error" && (
        <p className="text-sm text-rose mb-4">{errorMsg}</p>
      )}
      {docInfo && (
        <p className="text-xs text-[#6B7873] mb-7">
          {docInfo.char_count.toLocaleString()} characters across{" "}
          {docInfo.pages} page{docInfo.pages !== 1 ? "s" : ""}
        </p>
      )}

      {docInfo && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Subject">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-transparent border-b border-[#333B38] focus:border-gold outline-none py-2 text-sm text-[#E4E7E4]"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s} className="bg-panel">
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Chapter (optional)">
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Human Physiology"
                className="w-full bg-transparent border-b border-[#333B38] focus:border-gold outline-none py-2 text-sm text-[#E4E7E4] placeholder:text-[#5A625E]"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Questions">
              <input
                type="number"
                min={1}
                max={50}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full bg-transparent border-b border-[#333B38] focus:border-gold outline-none py-2 text-sm text-[#E4E7E4]"
              />
            </Field>
            <Field label="Difficulty">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-transparent border-b border-[#333B38] focus:border-gold outline-none py-2 text-sm text-[#E4E7E4]"
              >
                <option value="easy" className="bg-panel">Easy</option>
                <option value="medium" className="bg-panel">Medium</option>
                <option value="hard" className="bg-panel">Hard</option>
                <option value="mixed" className="bg-panel">Mixed</option>
              </select>
            </Field>
          </div>

          <div>
            <div className="text-[11px] tracking-[1.5px] text-[#6B7873] mb-2.5">
              MODE
            </div>
            <div className="flex gap-2">
              <ModeButton
                active={mode === "extract_existing"}
                onClick={() => setMode("extract_existing")}
                label="Existing PYQs"
              />
              <ModeButton
                active={mode === "generate_new"}
                onClick={() => setMode("generate_new")}
                label="Generate new"
              />
            </div>
          </div>

          <div className="pt-1 space-y-4">
            <div className="text-[11px] tracking-[1.5px] text-[#6B7873]">
              EXAM SETTINGS
            </div>

            <ToggleRow
              label="Timer for whole quiz"
              checked={timerEnabled}
              onChange={setTimerEnabled}
            >
              {timerEnabled && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={totalMinutes}
                    onChange={(e) => {
                      setMinutesTouched(true);
                      setTotalMinutes(Number(e.target.value));
                    }}
                    className="w-14 bg-card border border-[#333B38] rounded px-2 py-1 text-sm text-[#E4E7E4]"
                  />
                  <span className="text-xs text-[#6B7873]">min</span>
                </div>
              )}
            </ToggleRow>
            {timerEnabled && (
              <p className="text-[11px] text-[#6B7873] -mt-2">
                {numQuestions} questions in {totalMinutes} min — auto-submits
                when time runs out.
              </p>
            )}

            <ToggleRow
              label="Negative marking"
              checked={negativeMarking}
              onChange={setNegativeMarking}
            >
              {negativeMarking && (
                <div className="flex items-center gap-1.5 text-xs text-[#6B7873]">
                  <span>+</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={correctMarks}
                    onChange={(e) => setCorrectMarks(e.target.value)}
                    className="w-10 bg-card border border-[#333B38] rounded px-1.5 py-1 text-sm text-[#E4E7E4]"
                  />
                  <span>/ −</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-10 bg-card border border-[#333B38] rounded px-1.5 py-1 text-sm text-[#E4E7E4]"
                  />
                </div>
              )}
            </ToggleRow>
          </div>

          <button
            onClick={handleGenerate}
            disabled={status === "generating"}
            className="w-full bg-gold text-ink font-medium text-sm rounded-xl py-3.5 mt-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "generating" ? "Generating…" : "Generate Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[11px] tracking-[1.5px] text-[#6B7873] mb-1.5">
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function ModeButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-sm rounded-lg py-2.5 border transition-colors ${
        active
          ? "bg-gold/12 border-gold text-gold"
          : "border-[#333B38] text-[#8A9490]"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleRow({ label, checked, onChange, children }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-[#E4E7E4] flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
      {children}
    </div>
  );
}
