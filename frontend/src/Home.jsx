{stage === "upload" && (
  <div className="max-w-6xl mx-auto">

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
    <UploadBox onQuizReady={handleQuizReady} />

  </div>
)}
