"use client";
import { useEffect, useState } from "react";
import api from "../lib/api";

type Res = { status: string; message: string };

export default function MainStatus() {
  const [msg, setMsg] = useState<string>("Fetching app state...");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .get<Res>("/api/main", true)
      .then((r) => {
        if (mounted) setMsg(`${r.status}: ${r.message}`);
      })
      .catch((e) => setErr(e.message || "Failed"));
    return () => {
      mounted = false;
    };
  }, []);

  if (err) return <p className="text-red-500">{err}</p>;
  return <p className="text-sm text-neutral-500">{msg}</p>;
}

