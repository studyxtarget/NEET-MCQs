import React, { useState } from "react";
import { uploadPdf } from "./api";

export default function UploadBox({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setStatus("uploading");
    setErrorMsg("");
    try {
      const info = await uploadPdf(selected);
      onUploaded(info);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-panel border border-border rounded-2xl p-8 md:p-10 shadow-2xl space-y-6">
      <div>
        <div className="text-xs tracking-[3px] text-gold mb-2 font-mono font-semibold uppercase">
          STEP 1
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-[#F4EFE0]">
          Upload your PDF
        </h2>
        <p className="mt-2 text-sm text-[#9FC9BE] max-w-xl">
          Upload your NCERT notes, coaching module or PYQ PDF. AI will detect
          the chapter and topics automatically.
        </p>
      </div>

      <label
        htmlFor="pdf-upload"
        className="block border-2 border-dashed border-gold/30 rounded-2xl py-14 text-center cursor-pointer hover:border-gold hover:bg-gold/5 hover:-translate-y-1 transition-all duration-300"
      >
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-5xl mb-4">📄</div>
        <div className="font-semibold text-lg text-[#F4EFE0] truncate px-4">
          {file ? file.name : "Choose your PDF"}
        </div>
        <p className="text-sm text-[#6E9B8D] mt-2">NCERT • Notes • PYQs</p>
        <p className="text-[11px] text-[#5C8579] mt-2 font-mono">
          Supported: PDF • Max Size: 25 MB
        </p>
      </label>

      {status === "uploading" && (
        <p className="text-sm text-[#9FC9BE] animate-pulse">
          Extracting text…
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
