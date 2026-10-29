"use client";
import { useCallback, useEffect, useRef } from "react";

export function useIdleDetector(thresholdMinutes: number, enabled: boolean, onIdle: (seconds: number) => void) {
  const lastActivity = useRef(Date.now());
  const callback = useRef(onIdle);
  callback.current = onIdle;
  const resetActivity = useCallback(() => { lastActivity.current = Date.now(); }, []);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetActivity, { passive: true }));
    const interval = window.setInterval(() => {
      const idleSeconds = (Date.now() - lastActivity.current) / 1000;
      if (enabled && idleSeconds >= thresholdMinutes * 60) {
        callback.current(Math.round(idleSeconds));
        lastActivity.current = Date.now();
      }
    }, 1000);
    return () => { events.forEach((event) => window.removeEventListener(event, resetActivity)); window.clearInterval(interval); };
  }, [thresholdMinutes, enabled, resetActivity]);

  const simulateIdle = useCallback(() => {
    const seconds = thresholdMinutes * 60;
    lastActivity.current = Date.now();
    callback.current(seconds);
  }, [thresholdMinutes]);
  return { resetActivity, simulateIdle };
}
