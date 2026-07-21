import React, { useState } from "react";
import UploadBox from "./UploadBox";
import TopicSelect from "./TopicSelect";
import Instructions from "./Instructions";
import Quiz from "./Quiz";
import Result from "./Result";
import Dashboard from "./Dashboard";
import { saveAttempt } from "./quizHistory";

export default function Home() {
  const [stage, setStage] = useState("upload"); // upload | topics | instructions | quiz | result
  const [docInfo, setDocInfo] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [result, setResult] = useState(null);

  const handleUploaded = (info) => {
    setDocInfo(info);
    setStage("topics");
  };

  const handleQuizReady = (quiz) => {
    setQuizData(quiz);
    setStage("instructions");
  };

  const handleStart = () => {
    setStage("quiz");
  };

  const handleFinished = (res) => {
    saveAttempt({
      subject: quizData?.subject,
      chapter: quizData?.chapter,
      totalMarks: res.totalMarks,
      maxMarks: res.maxMarks,
      correctCount: res.correctCount,
      wrongCount: res.wrongCount,
      skippedCount: res.skippedCount,
      totalQuestions: res.totalQuestions,
      timeTakenSec: res.timeSummary?.totalTimeSec ?? null,
      topicBreakdown: res.topicBreakdown,
    });
    setResult(res);
    setStage("result");
  };

  const handleRestart = () => {
    setDocInfo(null);
    setQuizData(null);
    setResult(null);
    setStage("upload");
  };

  return (
    <>
      {stage === "upload" && (
        <div className="max-w-6xl mx-auto">
          <Dashboard />

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/10 text-gold font-mono text-xs tracking-[3px] uppercase">
              🧠 AI Powered
            </div>

            <h1 className="mt-6 font-display text-5xl md:text-6xl text-[#F4EFE0]">
              NEET AI Quiz
            </h1>

            <p className="mt-4 max-w-2xl mx-auto text-[#9FC9BE] text-lg">
              Upload your PDF and instantly generate Previous Year Questions or
              brand-new AI MCQs with detailed performance analysis.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            <div className="bg-panel border border-border rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold">PDF Upload</div>
              <div className="text-xs text-[#6E9B8D] mt-2">
                Upload any chapter PDF
              </div>
            </div>

            <div className="bg-panel border border-border rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-semibold">AI MCQs</div>
              <div className="text-xs text-[#6E9B8D] mt-2">
                Generate fresh questions
              </div>
            </div>

            <div className="bg-panel border border-border rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold">PYQs</div>
              <div className="text-xs text-[#6E9B8D] mt-2">
                Extract previous year questions
              </div>
            </div>

            <div className="bg-panel border border-border rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">Analytics</div>
              <div className="text-xs text-[#6E9B8D] mt-2">
                Score, accuracy & time analysis
              </div>
            </div>
          </div>

          {/* Upload */}
          <UploadBox onUploaded={handleUploaded} />
        </div>
      )}

      {stage === "topics" && docInfo && (
        <TopicSelect
          docInfo={docInfo}
          onQuizReady={handleQuizReady}
          onBack={handleRestart}
        />
      )}

      {stage === "instructions" && quizData && (
        <Instructions quizData={quizData} onStart={handleStart} />
      )}

      {stage === "quiz" && quizData && (
        <Quiz quizData={quizData} onFinished={handleFinished} />
      )}

      {stage === "result" && result && (
        <Result result={result} onRestart={handleRestart} onGoHome={handleRestart} />
      )}
    </>
  );
}
