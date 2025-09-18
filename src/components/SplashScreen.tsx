"use client";

import React, { useEffect, useState, useRef } from "react";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import animationData from "../../public/animations/loading.json";
export default function SplashScreen({
  children,
  label,
  autoHide,
}: {
  children?: React.ReactNode;
  label?: string;
  /**
   * If true, hides after a short delay to reveal children.
   * Defaults to true only when children are provided; otherwise stays visible.
   */
  autoHide?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  const shouldAutoHide = (autoHide ?? Boolean(children));
  useEffect(() => {
    if (!shouldAutoHide) return;
    const timer = setTimeout(() => setLoading(false), 5500);
    return () => clearTimeout(timer);
  }, [shouldAutoHide]);

  // speed up the animation playback (2x faster)
  useEffect(() => {
    if (lottieRef.current?.setSpeed) {
      try {
        lottieRef.current.setSpeed(2);
      } catch (e) {
        // ignore if setSpeed is unavailable on this version
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#2C2823]">
        <div className="flex flex-col items-center">
          <Lottie lottieRef={lottieRef} animationData={animationData} loop={false} />
          {label ? (
            <p className="mt-4 text-white text-center">{label}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
