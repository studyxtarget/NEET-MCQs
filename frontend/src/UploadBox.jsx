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
    <div className="max-w-3xl mx-auto bg-panel border border-border rounded-2xl p-8 md:p-10 shadow-2xl space-y-6">
      
      {/* 🧠 Hero Header */}
      <div>
        <div className="text-xs tracking-[3px] text-gold mb-2 font-mono font-semibold uppercase">
          STEP 1
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-[#F4EFE0]">
          Upload your PDF
        </h2>
        <p className="mt-2 text-sm text-[#9FC9BE] max-w-xl">
          Upload your NCERT notes, coaching PDF or PYQ file to generate an interactive quiz with AI.
        </p>
      </div>

      {/* 📄 Upload Area */}
      <label
        htmlFor="pdf-upload"
        className="block border-2 border-dashed border-gold/30 rounded-2xl py-14 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all duration-300"
      >
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-5xl mb-4">📄</div>
        <div className="font-semibold text-lg text-[#F4EFE0]">
          {file ? file.name : "Choose your PDF"}
        </div>
        <p className="text-sm text-[#6E9B8D] mt-2">
          NCERT • Notes • PYQs
        </p>
        <p className="text-[11px] text-[#5C8579] mt-2 font-mono">
          Supported: PDF • Max Size: 25 MB
        </p>
      </label>

      {status === "uploading" && (
        <p className="text-sm text-[#9FC9BE] animate-pulse">Extracting text…</p>
      )}

      {status === "error" && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
          {errorMsg}
        </p>
      )}

      {/* Success Info Box */}
      {docInfo && (
        <div className="text-xs text-[#9FC9BE] bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-1">
          <div className="font-semibold text-emerald-400 text-sm flex items-center gap-1.5 mb-1">
            <span>✅</span> PDF uploaded successfully
          </div>
          <div>
            Extracted <span className="font-mono text-white">{docInfo.char_count.toLocaleString()}</span> characters across{" "}
            <span className="font-mono text-white">{docInfo.pages}</span> page{docInfo.pages !== 1 ? "s" : ""}.
          </div>
        </div>
      )}

      {docInfo && (
        <div className="space-y-6">
          
          {/* 📘 Section 1: Subject & Chapter */}
          <div className="bg-ink/40 border border-border rounded-xl p-5 space-y-4 hover:border-gold/30 hover:shadow-lg transition-all duration-300">
            <div className="text-xs tracking-[2px] text-[#6E9B8D] font-mono font-semibold uppercase">
              📘 Subject & Chapter
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#9FC9BE] block mb-1.5 font-medium">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-ink border border-border rounded-xl px-3 py-2.5 text-sm text-[#EDEDE3] focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
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
                  Chapter (optional)
                </label>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="e.g. Body Fluids and Circulation"
                  className="w-full bg-ink border border-border rounded-xl px-3 py-2.5 text-sm text-[#EDEDE3] focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* ⚙️ Section 2: Quiz Settings */}
          <div className="bg-ink/40 border border-border rounded-xl p-5 space-y-4 hover:border-gold/30 hover:shadow-lg transition-all duration-300">
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
                  className="w-full bg-ink border border-border rounded-xl px-3 py-2.5 text-sm text-[#EDEDE3] focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-[#9FC9BE] block mb-1.5 font-medium">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-ink border border-border rounded-xl px-3 py-2.5 text-sm text-[#EDEDE3] focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#9FC9BE] block mb-2 font-medium">Mode</label>
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

          {/* 📝 Section 3: Exam Settings */}
          <div className="bg-ink/40 border border-border rounded-xl p-5 space-y-4 hover:border-gold/30 hover:shadow-lg transition-all duration-300">
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
                    className="w-20 bg-ink border border-border rounded-xl px-3 py-1.5 text-sm text-[#EDEDE3] focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none text-center font-mono"
                  />
                  <span className="text-xs text-[#6E9B8D] font-mono">min</span>
                </div>
              )}
            </div>
            {timerEnabled && (
              <p className="text-[11px] text-[#5C8579] -mt-2">
                {numQuestions} questions in {totalMinutes} min — auto-submits when time runs out.
              </p>
            )}

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
                    className="w-14 bg-ink border border-border rounded-xl px-2 py-1.5 text-sm text-[#EDEDE3] focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none text-center"
                  />
                  <span>/ −</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-14 bg-ink border border-border rounded-xl px-2 py-1.5 text-sm text-[#EDEDE3] focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none text-center"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 📊 Summary Card */}
          <div className="bg-ink/40 border border-border rounded-xl p-4 hover:border-gold/30 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between text-sm">
              <span className="text-[#9FC9BE]">Questions</span>
              <span className="font-mono text-[#F4EFE0] font-semibold">{numQuestions}</span>
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span className="text-[#9FC9BE]">Mode</span>
              <span className="font-mono text-[#F4EFE0] font-semibold">
                {mode === "extract_existing"
                  ? "Previous Year Questions"
                  : "AI Generated"}
              </span>
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span className="text-[#9FC9BE]">Difficulty</span>
              <span className="font-mono text-[#F4EFE0] font-semibold capitalize">{difficulty}</span>
            </div>
          </div>

          {/* 🚀 Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={status === "generating"}
            className="w-full bg-gold text-ink font-mono text-base font-bold tracking-wide rounded-xl py-4 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "generating" ? (
              <span className="inline-flex items-center gap-2 animate-pulse">
                <span>⏳</span> Generating Quiz...
              </span>
            ) : (
              <span>🚀 Generate Quiz</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
