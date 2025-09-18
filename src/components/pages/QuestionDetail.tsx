"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import type { GetQuestionRes, SubmitResponseRes } from "@/lib/types";
import LoadingOverlay from "@/components/LoadingOverlay";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/store/appStore";
import QRScannerOverlay from "@/components/QRScannerOverlay";
import NFCScannerOverlay from "@/components/NFCScannerOverlay";

const SUBMISSIONS_CLOSED = false;

export default function QuestionDetail({ id: propId, onClose }: { id?: string; onClose?: () => void }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = (propId || (params?.id as string)) as string;
  const { initialized, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<GetQuestionRes["data"] | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [nfcOpen, setNfcOpen] = useState(false);
  const { setHideNav, guestMode } = useAppStore() as any;

  useEffect(() => { setHideNav(true); return () => setHideNav(false); }, [setHideNav]);

  const refresh = async () => {
    setErr(null); setSubmitMsg(null); setPoints(null); setLoading(true);
    try {
      const res = await api.get<GetQuestionRes>(`/api/questions/${id}`);
      setData(res.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to fetch question");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (id && initialized && user) void refresh(); }, [id, initialized, user]);

  const currentPart = useMemo(() => {
    if (!data || !data.question_parts?.length) return null;
    return data.question_parts[data.question_parts.length - 1];
  }, [data]);

  const submit = async () => {
    if (!currentPart) return;
    if (SUBMISSIONS_CLOSED) {
      setSubmitMsg("Submissions are closed at the moment.");
      setShowIncorrect(true);
      return;
    }
    setSubmitMsg(null); setPoints(null); setBusy(true);
    try {
      const normalized = answer.replace(/\s+/g, "").toUpperCase();
      const payload: { type: string; data: string; question_part_id: string } = { type: "STRING", data: normalized, question_part_id: currentPart.id };
      const res = await api.post<SubmitResponseRes>("/api/response/", payload);
      const rData: any = (res as any).data || {};
      const responseObj: any = rData.response;
      const isCorrect = !!(responseObj && responseObj.is_correct === true);
      if (!isCorrect) {
        setSubmitMsg((res as any).message || "Incorrect answer.");
        setShowIncorrect(true);
      } else {
        const ptsRaw = rData.points; const ptsNum = typeof ptsRaw === 'number' ? ptsRaw : (typeof ptsRaw === 'string' ? parseInt(ptsRaw, 10) : null);
        setPoints(Number.isFinite(ptsNum as number) ? (ptsNum as number) : null);
        setSubmitMsg(Number.isFinite(ptsNum as number) ? "Correct! Points awarded." : "Submitted.");
        setAnswer("");
        await refresh();
        setShowSuccess(true);
      }
    } catch (e) {
      setSubmitMsg(e instanceof Error ? e.message : "Incorrect or already solved.");
      setShowIncorrect(true);
    } finally { setBusy(false); }
  };

  const submitQR = async (qrValue: string, photoUrl?: string) => {
    if (!currentPart) return;
    setSubmitMsg(null); setPoints(null); setBusy(true); setScanOpen(false);
    try {
      const payload: any = { type: "QR", data: String(qrValue), question_part_id: currentPart.id };
      if (photoUrl) payload.photo_url = photoUrl;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, maximumAge: 10_000, timeout: 4_000 });
        });
        if (pos && pos.coords) { payload.latitude = pos.coords.latitude; payload.longitude = pos.coords.longitude; }
      } catch {}
      const res = await api.post<SubmitResponseRes>("/api/response/", payload);
      const rData: any = (res as any).data || {};
      const responseObj: any = rData.response;
      const isCorrect = !!(responseObj && responseObj.is_correct === true);
      if (!isCorrect) {
        setSubmitMsg("Incorrect or already solved."); setShowIncorrect(true);
      } else {
        const ptsRaw = rData.points; const ptsNum = typeof ptsRaw === 'number' ? ptsRaw : (typeof ptsRaw === 'string' ? parseInt(ptsRaw, 10) : null);
        setPoints(Number.isFinite(ptsNum as number) ? (ptsNum as number) : null);
        setSubmitMsg(Number.isFinite(ptsNum as number) ? "Correct! Points awarded." : "Submitted.");
        await refresh(); setShowSuccess(true);
      }
    } catch (e) {
      setSubmitMsg(e instanceof Error ? e.message : "Incorrect or already solved."); setShowIncorrect(true);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none select-none" style={{ backgroundImage: "url('/images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <div className="relative ch-container ch-container-narrow py-6 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { if (onClose) onClose(); else router.back(); }} aria-label="Back" className="rounded-full p-2 hover:opacity-90">
            <img src="/images/QuestionsPage/left-arrow.svg" alt="Back" className="w-5 h-5" />
          </button>
          <h1 className="font-qurova ch-gradient-text ch-h3">{data?.question_name || "Question"}</h1>
        </div>
        {loading && <p className="font-area ch-subtext">Loading…</p>}
        {err && <p className="text-red-400 font-area">{err}</p>}
        {currentPart && (
          <div className="grid gap-4">
            <div className="rounded-2xl p-4 ch-card question-content">
              <PartContent part={currentPart} />
            </div>
            <div className="grid gap-2">
              <label className="font-area ch-subtext text-sm">Your Answer</label>
              {SUBMISSIONS_CLOSED && <p className="font-area text-amber-300 text-sm">Submissions are currently closed.</p>}
              <input disabled={SUBMISSIONS_CLOSED} value={answer} onChange={(e) => setAnswer(e.target.value)} className="h-11 rounded-xl px-4 bg-neutral-800 text-white outline-none font-area disabled:opacity-60" placeholder="Type answer" />
              <div className="flex gap-2">
                <button disabled={SUBMISSIONS_CLOSED} onClick={submit} className="h-11 rounded-xl font-qurova ch-btn flex-1">Submit</button>
                {!guestMode && (
                  <>
                    <button disabled={SUBMISSIONS_CLOSED} onClick={() => setScanOpen(true)} className="h-11 rounded-xl font-qurova flex items-center justify-center px-4" style={{ border: '1px solid rgba(255,255,255,.12)' }}>
                      <img src="/images/QuestionsPage/qricon.svg" alt="qr" className="w-5 h-5 mr-2" /> Scan QR
                    </button>
                    <button disabled={SUBMISSIONS_CLOSED} onClick={() => setNfcOpen(true)} className="h-11 rounded-xl font-qurova flex items-center justify-center px-4" style={{ border: '1px solid rgba(255,255,255,.12)' }}>
                      <img src="/images/QuestionsPage/nfc.svg" alt="nfc" className="w-5 h-5 mr-2" /> Scan NFC
                    </button>
                  </>
                )}
              </div>
            </div>
            {submitMsg && <p className="font-area" style={{ color: points && points > 0 ? '#22c55e' : '#fca5a5' }}>{submitMsg}{points != null ? ` (+${points})` : ''}</p>}
          </div>
        )}
      </div>
      <LoadingOverlay show={busy} label="Submitting..." />
      <QRScannerOverlay open={scanOpen} onClose={() => setScanOpen(false)} onDetect={(v)=> submitQR(v)} />
      <NFCScannerOverlay open={nfcOpen} onClose={() => setNfcOpen(false)} onRead={(t)=> { setAnswer(String(t)); setNfcOpen(false); }} />
      <Modal open={showSuccess} onClose={()=>setShowSuccess(false)} title="Submitted ✅" success>
        <p className="font-area ch-text">{points != null ? (<span>You earned <span className="font-qurova" style={{ color:'#22c55e' }}>+{points}</span> points.</span>) : 'Submitted successfully.'}</p>
      </Modal>
      <Modal open={showIncorrect} onClose={()=>setShowIncorrect(false)} title="Try again">
        <p className="font-area ch-text">{submitMsg || "That doesn’t match. Check the question again! Ensure no spaces in the answer."}</p>
      </Modal>
    </div>
  );
}

function PartContent({ part }: { part: { id: string; content: Array<string | { type?: string; data?: string; text?: string; url?: string }> } }) {
  const isImageUrl = (s: string) => {
    if (!s) return false;
    const url = s.trim();
    if (/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(url)) return true;
    if (url.startsWith('data:image')) return true;
    try { const u = new URL(url); const pathname = u.pathname || ''; if (/\.(png|jpe?g|gif|svg|webp)$/i.test(pathname)) return true; } catch {}
    return false;
  };
  const normType = (t: unknown) => (typeof t === 'string' ? t.toLowerCase() : '');

  const LinkOrImage = ({ url }: { url: string }) => {
    const [broken, setBroken] = useState(false);
    if (!broken) {
      return <img src={url} alt="content" className="ch-img" onError={() => setBroken(true)} />;
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="font-area underline ch-text">
        Open link
      </a>
    );
  };

  return (
    <div className="rounded-xl p-4 ch-card">
      <div className="grid gap-3">
        {Array.isArray(part.content) && part.content.map((c, idx) => {
          if (typeof c === 'string') { return <p key={idx} className="font-area ch-text whitespace-pre-wrap">{c}</p>; }
          const t = normType((c as { type?: string }).type);
          const data: string | undefined = (c as any).data ?? (c as any).text ?? (c as any).url;
          if (!data) return null;
          const lower = data.toLowerCase();
          const isPdf = /\.pdf($|\?)/i.test(lower) || t.includes('file');
          if (isPdf) {
            return (
              <div key={idx} className="flex items-center justify-between gap-3 rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <img src="/images/QuestionsPage/file.svg" alt="file" className="w-6 h-6 opacity-80" />
                  <div className="min-w-0">
                    <p className="font-area ch-text text-sm truncate">{data.split('/').pop()}</p>
                    <p className="font-area ch-subtext text-xs">PDF Attachment</p>
                  </div>
                </div>
                <a href={data} download target="_blank" rel="noopener noreferrer" className="font-qurova text-xs px-3 py-2 rounded-lg" style={{ background:'#F5753B', color:'#fff' }}>Download</a>
              </div>
            );
          }
          if (t.includes('image') || isImageUrl(data)) { return <img key={idx} src={data} alt="content" className="ch-img" />; }
          if (t.includes('link') || t.includes('url')) { return <LinkOrImage key={idx} url={data} />; }
          if (t === '' || t.includes('text') || t === 'string') { return <p key={idx} className="font-area ch-text whitespace-pre-wrap">{data}</p>; }
          return <p key={idx} className="font-area ch-text whitespace-pre-wrap">{data}</p>;
        })}
      </div>
    </div>
  );
}
