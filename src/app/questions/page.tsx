"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import type { MainGeneric } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";

export default function QuestionsIndex() {
  const { initialized, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Array<{ id: string; name: string; difficulty?: { level?: string } }>>([]);
  const [note, setNote] = useState<string | null>(null);
  const [solved, setSolved] = useState<Array<{ id: string; name: string; difficulty?: { level?: string } }>>([]);
  const [openId, setOpenId] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!initialized || !user) return; // layout handles redirect
      setErr(null); setNote(null); setLoading(true);
      try {
        const res = await api.get<MainGeneric>("/api/main");
        if (!mounted) return;
        if (res.message === "PHASE_ACTIVE" && (res.data as MainGeneric["data"] & { questions?: Array<{ id: string; name: string; difficulty?: { level?: string } }>; solved_questions?: Array<{ id: string; name: string; difficulty?: { level?: string } }> }).questions) {
          const data = res.data as MainGeneric["data"] & { questions?: Array<{ id: string; name: string; difficulty?: { level?: string } }>; solved_questions?: Array<{ id: string; name: string; difficulty?: { level?: string } }> } || {};
          setQuestions(data.questions || []);
          setSolved(data.solved_questions || []);
        } else {
          setNote(`Status: ${res.message}. You can still open a question directly if you know its id.`);
        }
      } catch (e) {
        if (e instanceof Error) setErr(e.message);
        else setErr("Failed to load questions");
      } finally { setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [initialized, user]);

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none select-none" style={{ backgroundImage: "url('/images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <div className="relative ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/images/QuestionsPage/refresh.svg" alt="refresh" width={20} height={20} className="w-5 h-5 opacity-80" onClick={() => location.reload()} />
          <h1 className="font-qurova ch-gradient-text ch-h2">Questions</h1>
        </div>
        {loading && <p className="font-area ch-subtext">Loading…</p>}
        {err && <p className="text-red-400 font-area">{err}</p>}
        {note && <p className="font-area ch-subtext">{note}</p>}
        {note && (
          <div className="mt-4 grid gap-2">
            <div className="flex gap-2 items-center">
              <input value={openId} onChange={(e) => setOpenId(e.target.value)} className="h-11 flex-1 rounded-xl px-4 bg-neutral-800 text-white outline-none font-area" placeholder="Enter question ID" />
              <Link prefetch={false} href={openId ? `/questions/${openId}` : '#'} className="px-4 py-2 rounded-xl font-qurova ch-btn">Open</Link>
            </div>
          </div>
        )}

        {/* Scroll area for lists so only this section scrolls */}
        <div className="scroll-area-y mt-4">
          {questions.length > 0 && (
            <ul className="grid gap-3">
              {questions.map((q) => (
                <li key={q.id} className="rounded-xl p-4 flex items-center justify-between ch-card">
                  <div>
                    <p className="ch-text font-qurova text-lg">{q.name}</p>
                    <p className="font-area ch-subtext text-sm">{q.difficulty?.level || ''}</p>
                  </div>
                  <Link href={`/questions/${q.id}`} className="px-4 py-2 rounded-xl font-qurova ch-btn">Open</Link>
                </li>
              ))}
            </ul>
          )}
          {solved.length > 0 && (
            <div className="mt-8">
              <h3 className="font-qurova ch-text mb-2">Solved</h3>
              <ul className="grid gap-3">
                {solved.map((q) => (
                  <li key={q.id} className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid #2e7d32' }}>
                    <div>
                      <p className="ch-text font-qurova text-lg">{q.name}</p>
                      <p className="font-area ch-subtext text-sm">{q.difficulty?.level || ''}</p>
                    </div>
                    <span className="font-qurova" style={{ color: '#22c55e' }}>Completed</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
