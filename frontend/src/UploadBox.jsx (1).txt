import React, { useEffect, useState } from "react";
import { uploadPdf, generateQuiz } from "./api";

const SUBJECTS = ["Biology", "Physics", "Chemistry"];

export default function UploadBox({ onQuizReady }) {
  const [file, setFile] = useState(null);
  const [docInfo, setDocInfo] = useState(null); // result of /upload
  const [subject, setSubject] = useState("Biology");
  const [chapter, setChapter] = useState("");
  const [numQuestions, setNumQuestions] = useState(15);
  const [difficulty, setDifficulty] = useState("medium");
  const [mode, setMode] = useState("extract_existing");

  // Quick-win settings: timer + negative marking
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(numQuestions); // default: 1 min/question
  const [minutesTouched, setMinutesTouched] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [correctMarks, setCorrectMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);

  const [status, setStatus] = useState("idle"); // idle | uploading | ready | generating | error
  const [errorMsg, setErrorMsg] = useState("");

  // Keep the suggested exam duration in sync with question count (1 min/question)
  // until the person overrides it themselves.
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
    <div className="max-w-lg mx-auto bg-panel border border-border rounded-xl p-8">
      <div className="text-xs tracking-[3px] text-gold mb-2">STEP 1</div>
      <h2 className="font-display text-2xl text-[#F4EFE0] mb-6">
        Upload your PDF
      </h2>

      <label
        htmlFor="pdf-upload"
        className="block border-2 border-dashed border-border rounded-lg py-10 text-center cursor-pointer hover:border-gold transition-colors mb-6"
      >
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-[#9FC9BE] text-sm">
          {file ? file.name : "Choose a PDF (NCERT chapter, notes, or PYQ bank)"}
        </div>
      </label>

      {status === "uploading" && (
        <p className="text-sm text-[#9FC9BE] mb-4">Extracting text…</p>
      )}

      {status === "error" && (
        <p className="text-sm text-rose mb-4">{errorMsg}</p>
      )}

      {docInfo && (
        <div className="text-xs text-[#6E9B8D] mb-6 bg-ink/40 rounded p-3">
          Extracted {docInfo.char_count.toLocaleString()} characters across{" "}
          {docInfo.pages} page{docInfo.pages !== 1 ? "s" : ""}.
        </div>
      )}

      {docInfo && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#9FC9BE] block mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-ink border border-border rounded px-3 py-2 text-sm text-[#EDEDE3]"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#9FC9BE] block mb-1">
              Chapter (optional)
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Body Fluids and Circulation"
              className="w-full bg-ink border border-border rounded px-3 py-2 text-sm text-[#EDEDE3]"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-[#9FC9BE] block mb-1">
                Questions
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full bg-ink border border-border rounded px-3 py-2 text-sm text-[#EDEDE3]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-[#9FC9BE] block mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-ink border border-border rounded px-3 py-2 text-sm text-[#EDEDE3]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9FC9BE] block mb-2">Mode</label>
            <div className="flex gap-4 text-sm text-[#EDEDE3]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={mode === "extract_existing"}
                  onChange={() => setMode("extract_existing")}
                />
                Existing PYQs in PDF
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={mode === "generate_new"}
                  onChange={() => setMode("generate_new")}
                />
                Generate new MCQs
              </label>
            </div>
          </div>

          {/* Exam settings: timer + negative marking */}
          <div className="border-t border-border pt-4 space-y-4">
            <div className="text-xs tracking-[2px] text-[#6E9B8D]">
              EXAM SETTINGS
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-[#EDEDE3] flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timerEnabled}
                  onChange={(e) => setTimerEnabled(e.target.checked)}
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
  placeholder="15"
  onChange={(e) => {
    setMinutesTouched(true);

    const value = e.target.value;

    if (value === "") {
      setTotalMinutes("");
      return;
    }

    const num = Number(value);

    if (!Number.isNaN(num)) {
      setTotalMinutes(num);
    }
  }}
  onBlur={() => {
    if (totalMinutes === "") {
      setTotalMinutes(numQuestions);
      setMinutesTouched(false);
    }
  }}
  className="w-16 bg-ink border border-border rounded px-2 py-1 text-sm text-[#EDEDE3]"
/>
                  <span className="text-xs text-[#6E9B8D]">min</span>
                </div>
              )}
            </div>
            {timerEnabled && (
              <p className="text-[11px] text-[#5C8579] -mt-2">
                {numQuestions} questions in {totalMinutes} min — auto-submits
                when time runs out.
              </p>
            )}

            <div className="flex items-center justify-between">
              <label className="text-sm text-[#EDEDE3] flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                />
                Negative marking
              </label>
              {negativeMarking && (
                <div className="flex items-center gap-2 text-xs text-[#6E9B8D]">
                  <span>+</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={correctMarks}
                    onChange={(e) => setCorrectMarks(e.target.value)}
                    className="w-12 bg-ink border border-border rounded px-2 py-1 text-sm text-[#EDEDE3]"
                  />
                  <span>/ −</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-12 bg-ink border border-border rounded px-2 py-1 text-sm text-[#EDEDE3]"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={status === "generating"}
            className="w-full bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 mt-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "generating" ? "Generating…" : "Generate Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}
