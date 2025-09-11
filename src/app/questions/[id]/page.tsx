"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../lib/api";
import type { GetQuestionRes, SubmitResponseRes } from "../../../lib/types";
import LoadingOverlay from "../../../components/LoadingOverlay";
import Modal from "../../../components/Modal";

const MainColors = { orange: "#F5753B", text: "#ffffff", subText: "#cccccc" } as const;

export default function QuestionDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<GetQuestionRes["data"] | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);

  // fetch question parts
  const refresh = async () => {
    setErr(null); setSubmitMsg(null); setPoints(null); setLoading(true);
    try {
      const res = await api.get<GetQuestionRes>(`/api/questions/${id}`);
      setData(res.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to fetch question");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (id) void refresh(); }, [id, refresh]);

  const currentPart = useMemo(() => {
    if (!data || !data.question_parts?.length) return null;
    return data.question_parts[data.question_parts.length - 1];
  }, [data]);

  const submit = async () => {
    if (!currentPart) return;
    setSubmitMsg(null); setPoints(null); setBusy(true);
    try {
  const payload: { type: string; data: string; question_part_id: string } = { type: "STRING", data: answer.trim().toUpperCase(), question_part_id: currentPart.id };
      const res = await api.post<SubmitResponseRes>("/api/response/", payload);
      setPoints(res.data.points);
      setSubmitMsg("Correct! Points awarded.");
      setAnswer("");
      await refresh();
      setShowSuccess(true);
    } catch (e) {
      setSubmitMsg(e instanceof Error ? e.message : "Incorrect or already solved.");
      setShowIncorrect(true);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none select-none" style={{ backgroundImage: "url('/Images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <div className="relative ch-container ch-container-narrow py-6 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} aria-label="Back" className="rounded-full p-2 hover:opacity-90">
            <img src="/Images/QuestionsPage/left-arrow.svg" alt="Back" className="w-5 h-5" />
          </button>
          <h1 className="font-qurova ch-gradient-text ch-h3">{data?.question_name || "Question"}</h1>
        </div>
        {loading && <p className="font-area ch-subtext">Loading…</p>}
        {err && <p className="text-red-400 font-area">{err}</p>}

        {currentPart && (
          <div className="grid gap-4">
            <div className="rounded-2xl p-4 ch-card">
              <PartContent part={currentPart} />
            </div>
            <div className="grid gap-2">
              <label className="font-area ch-subtext text-sm">Your Answer</label>
              <input value={answer} onChange={(e) => setAnswer(e.target.value)} className="h-11 rounded-xl px-4 bg-neutral-800 text-white outline-none font-area" placeholder="Type answer" />
              <button onClick={submit} className="h-11 rounded-xl font-qurova ch-btn">Submit</button>
            </div>
            {submitMsg && <p className="font-area" style={{ color: points ? '#22c55e' : '#fca5a5' }}>{submitMsg}{points ? ` (+${points})` : ''}</p>}
          </div>
        )}

      </div>
      <LoadingOverlay show={busy} label="Submitting..." />
      <Modal open={showSuccess} onClose={()=>setShowSuccess(false)} title="Correct ✅" success>
        <p className="font-area ch-text">You earned <span className="font-qurova" style={{ color:'#22c55e' }}>+{points ?? 0}</span> points.</p>
      </Modal>
      <Modal open={showIncorrect} onClose={()=>setShowIncorrect(false)} title="Try again">
        <p className="font-area ch-text">That doesn’t match. Check the hint or re-read the prompt.</p>
      </Modal>
    </div>
  );
}

function PartContent({ part }: { part: { id: string; content: Array<string | { type?: string; data?: string; text?: string; url?: string }> } }) {
  const isImageUrl = (s: string) => /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(s) || s.startsWith('data:image') || s.startsWith('http') && /(\/(png|jpe?g|gif|svg|webp))/.test(s);
  const normType = (t: unknown) => (typeof t === 'string' ? t.toLowerCase() : '');

  return (
    <div className="rounded-xl p-4 ch-card">
      <div className="grid gap-3">
        {Array.isArray(part.content) && part.content.map((c, idx) => {
          // Handle both object and string content
          if (typeof c === 'string') {
            return <p key={idx} className="font-area ch-text whitespace-pre-wrap">{c}</p>;
          }
          const t = normType((c as { type?: string }).type);
          const data: string | undefined = (c as { data?: string; text?: string; url?: string }).data ?? (c as { text?: string }).text ?? (c as { url?: string }).url;
          // Image
          if (data && (t.includes('image') || isImageUrl(data))) {
            return <img key={idx} src={data} alt="content" className="ch-img" />;
          }
          // Link
          if (data && (t.includes('link') || t.includes('url'))) {
            return <a key={idx} href={data} target="_blank" rel="noopener noreferrer" className="font-area underline ch-text">Open link</a>;
          }
          // Text (including TEXT)
          if (data && (t === '' || t.includes('text') || t === 'string')) {
            return <p key={idx} className="font-area ch-text whitespace-pre-wrap">{data}</p>;
          }
          // Fallback: if object has data, show it as text, else skip noisy blob
          if (data) {
            return <p key={idx} className="font-area ch-text whitespace-pre-wrap">{data}</p>;
          }
          return null;
        })}
      </div>
    </div>
  );
}
