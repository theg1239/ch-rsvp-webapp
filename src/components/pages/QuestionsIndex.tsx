"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import type { MainGeneric } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import PhaseHeader from "@/components/PhaseHeader";
import PhaseTimer from "@/components/PhaseTimer";
import { useAppStore } from "@/store/appStore";
import RegistrationPrompt from "@/components/RegistrationPrompt";

const QuestionDetail = dynamic(() => import("@/components/pages/QuestionDetail"), { ssr: false });

export default function QuestionsIndex() {
  const { initialized, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Array<{ id: string; name: string; difficulty?: { level?: string } }>>([]);
  const [note, setNote] = useState<string | null>(null);
  const [solved, setSolved] = useState<Array<{ id: string; name: string; difficulty?: { level?: string } }>>([]);
  const [openId, setOpenId] = useState("");
  const [phaseInfo, setPhaseInfo] = useState<{ phase?: number; next?: string } | null>(null);
  const { guestMode, questionId, openQuestion, closeQuestion } = useAppStore() as any;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!initialized || !user) return; // layout handles redirect
      setErr(null); setNote(null); setLoading(true);
      try {
        const res = await api.get<MainGeneric>("/api/main");
        if (!mounted) return;
        if (res.message === "PHASE_ACTIVE" && (res.data as any).questions) {
          const data = (res.data as any) || {};
          setQuestions(data.questions || []);
          setSolved(data.solved_questions || []);
          setPhaseInfo({ phase: data.active_phase, next: data.next_phase_time });
        } else {
          setNote(`Status: ${res.message}. You can still open a question directly if you know its id.`);
          const d: any = res.data || {}; setPhaseInfo({ phase: d.active_phase, next: d.next_phase_time });
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
        {!guestMode && phaseInfo && (
          <div className="grid gap-3 mb-4">
            <PhaseHeader phase={phaseInfo.phase ?? '—'} title="Phase Progress" subtitle={phaseInfo.next ? `Next: ${new Date(phaseInfo.next).toLocaleString()}` : undefined} />
            {phaseInfo.next && <PhaseTimer until={phaseInfo.next} />}
          </div>
        )}
        {guestMode && (
          <div className="grid gap-3 mb-6">
            <div className="rounded-2xl p-4 ch-card ch-card--outlined" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <h2 className="font-qurova ch-gradient-text ch-h3 mb-1">Cryptic Hunt Starts Soon</h2>
              <p className="font-area ch-subtext text-sm">The hunt begins on <strong className="font-qurova" style={{ color: '#F5753B' }}>26 Sept 2025</strong>. Explore this demo interface meanwhile.</p>
            </div>
          </div>
        )}
        <RegistrationPrompt view="questions" className="mb-6" />
        {loading && <p className="font-area ch-subtext">Loading…</p>}
        {err && <p className="text-red-400 font-area">{err}</p>}
        {note && <p className="font-area ch-subtext">{note}</p>}
        {note && (
          <div className="mt-4 grid gap-2">
            <div className="flex gap-2 items-center">
              <input value={openId} onChange={(e) => setOpenId(e.target.value)} className="h-11 flex-1 rounded-xl px-4 bg-neutral-800 text-white outline-none font-area" placeholder="Enter question ID" />
              <button onClick={()=> openId && openQuestion(openId)} className="px-4 py-2 rounded-xl font-qurova ch-btn">Open</button>
            </div>
          </div>
        )}

  <div className="questions-scroll mt-4 pr-1">
          {questions.length > 0 && (
            <ul className="grid gap-3">
              {questions.map((q) => (
                <li key={q.id} className="rounded-xl p-4 flex items-center justify-between ch-card">
                  <div>
                    <p className="ch-text font-qurova text-lg">{q.name}</p>
                    <p className="font-area ch-subtext text-sm">
                      {(() => {
                        const lvl = q.difficulty?.level?.toString() ?? '';
                        return /^\d+$/.test(lvl) ? `Level ${lvl}` : lvl;
                      })()}
                    </p>
                  </div>
                  <button onClick={()=> openQuestion(q.id)} className="px-4 py-2 rounded-xl font-qurova ch-btn">Open</button>
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
                      <p className="font-area ch-subtext text-sm">
                        {(() => {
                          const lvl = q.difficulty?.level?.toString() ?? '';
                          return /^\d+$/.test(lvl) ? `Level ${lvl}` : lvl;
                        })()}
                      </p>
                    </div>
                    <span className="font-qurova" style={{ color: '#22c55e' }}>Completed</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Spacer removed; bottom padding handled by questions-scroll */}
        </div>
      </div>
      {questionId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(0,0,0,0.6)] backdrop-blur-sm" aria-modal="true" role="dialog">
          <QuestionDetail id={questionId} onClose={closeQuestion} />
        </div>
      )}
    </div>
  );
}
