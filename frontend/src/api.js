// Points at your local FastAPI server (see backend/README.md).
// For deployment, replace with your real backend URL or read from
// an env var: `import.meta.env.VITE_API_BASE_URL`.
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://neet-mcq-backend-production.up.railway.app";
async function handleResponse(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON; fall back to statusText
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(res);
}

export async function generateQuiz({
  docId,
  subject,
  chapter,
  numQuestions,
  difficulty,
  mode,
}) {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doc_id: docId,
      subject,
      chapter: chapter || null,
      num_questions: numQuestions,
      difficulty,
      mode,
    }),
  });
  return handleResponse(res);
}

export async function submitQuiz({ docId, answers }) {
  const res = await fetch(`${BASE_URL}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doc_id: docId,
      answers, // [{ question_index, selected_index }]
    }),
  });
  return handleResponse(res);
}
