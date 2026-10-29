"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSubscription } from "@/lib/subscription";
import { useIdleDetector } from "./useIdleDetector";

type TimerStatus = "running" | "paused" | "stopped";
type Category = "Productive" | "Neutral" | "Distracting";
interface TimerData { status: TimerStatus; elapsed: number; idle: number; startedAt: number | null; task: string; category: Category; lastSession: number }
interface TimerValue extends TimerData {
  elapsedSeconds: number;
  idleOpen: boolean;
  idleDuration: number;
  start: () => void; pause: () => void; stop: () => void;
  setTask: (task: string) => void; setCategory: (category: Category) => void;
  keepIdle: () => void; discardIdle: () => void; takeBreak: () => void; simulateIdle: () => void;
}
const TimerContext = createContext<TimerValue | null>(null);
const initial: TimerData = { status: "stopped", elapsed: 0, idle: 0, startedAt: null, task: "Product strategy", category: "Productive", lastSession: 0 };
const currentElapsed = (data: TimerData) => data.elapsed + (data.status === "running" && data.startedAt ? (Date.now() - data.startedAt) / 1000 : 0);
const settled = (data: TimerData): TimerData => ({ ...data, elapsed: currentElapsed(data), startedAt: data.status === "running" ? Date.now() : null });

export function TimerProvider({ children }: { children: ReactNode }) {
  const { authenticated, canUseApp } = useSubscription();
  const [data, setData] = useState<TimerData>(initial);
  const dataRef = useRef(data);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [threshold, setThreshold] = useState(5);
  const [idleOpen, setIdleOpen] = useState(false);
  const [idleDuration, setIdleDuration] = useState(0);
  const autoStarted = useRef(false);
  const resumeAfterVisible = useRef(false);

  useEffect(() => {
    let saved = initial;
    try { saved = { ...initial, ...JSON.parse(localStorage.getItem("pulse:timer") || "{}") }; } catch { /* use initial */ }
    const recovered = { ...saved, startedAt: saved.status === "running" ? Date.now() : null };
    setData(recovered); dataRef.current = recovered;
    setElapsedSeconds(currentElapsed(recovered));
    setThreshold(Math.min(30, Math.max(1, Number(localStorage.getItem("pulse:idleThreshold")) || 5)));
    autoStarted.current = localStorage.getItem("pulse:autoStarted") === "true";
    const settings = () => setThreshold(Math.min(30, Math.max(1, Number(localStorage.getItem("pulse:idleThreshold")) || 5)));
    window.addEventListener("pulse:settings", settings);
    return () => window.removeEventListener("pulse:settings", settings);
  }, []);

  useEffect(() => { dataRef.current = data; localStorage.setItem("pulse:timer", JSON.stringify(data)); }, [data]);
  useEffect(() => {
    const interval = window.setInterval(() => setElapsedSeconds(currentElapsed(dataRef.current)), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const start = useCallback(() => setData((prev) => prev.status === "running" ? prev : { ...prev, status: "running", startedAt: Date.now() }), []);
  const pause = useCallback(() => setData((prev) => ({ ...settled(prev), status: "paused", startedAt: null })), []);
  const stop = useCallback(() => setData((prev) => ({ ...prev, status: "stopped", elapsed: 0, startedAt: null, lastSession: currentElapsed(prev) })), []);

  useEffect(() => {
    if (!authenticated || !canUseApp) return;
    const autoStart = (event: Event) => {
      if ((event.target as HTMLElement | null)?.closest(".timer-actions")) return;
      if (!autoStarted.current && dataRef.current.status === "stopped") {
        autoStarted.current = true; localStorage.setItem("pulse:autoStarted", "true"); start();
      }
    };
    window.addEventListener("pointerdown", autoStart);
    window.addEventListener("keydown", autoStart);
    return () => { window.removeEventListener("pointerdown", autoStart); window.removeEventListener("keydown", autoStart); };
  }, [authenticated, canUseApp, start]);

  useEffect(() => {
    const visibility = () => {
      if (document.hidden && dataRef.current.status === "running") { resumeAfterVisible.current = true; pause(); }
      else if (!document.hidden && resumeAfterVisible.current) { resumeAfterVisible.current = false; start(); }
    };
    const pagehide = () => { if (dataRef.current.status === "running") { const next = settled(dataRef.current); localStorage.setItem("pulse:timer", JSON.stringify(next)); } };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", pagehide);
    return () => { document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pagehide", pagehide); };
  }, [pause, start]);

  const idleHandler = useCallback((seconds: number) => { setIdleDuration(seconds); setIdleOpen(true); }, []);
  const { resetActivity, simulateIdle } = useIdleDetector(threshold, data.status === "running" && !idleOpen, idleHandler);
  const closeIdle = useCallback(() => { setIdleOpen(false); resetActivity(); }, [resetActivity]);
  const keepIdle = useCallback(() => closeIdle(), [closeIdle]);
  const discardIdle = useCallback(() => {
    setData((prev) => {
      const next = settled(prev);
      return { ...next, elapsed: Math.max(0, next.elapsed - idleDuration), idle: next.idle + idleDuration };
    });
    closeIdle();
  }, [closeIdle, idleDuration]);
  const takeBreak = useCallback(() => {
    setData((prev) => {
      const next = settled(prev);
      return { ...next, status: "paused", startedAt: null, elapsed: Math.max(0, next.elapsed - idleDuration), idle: next.idle + idleDuration };
    });
    closeIdle();
  }, [closeIdle, idleDuration]);

  const value: TimerValue = {
    ...data, elapsedSeconds, idleOpen, idleDuration, start, pause, stop,
    setTask: (task) => setData((prev) => ({ ...prev, task })),
    setCategory: (category) => setData((prev) => ({ ...prev, category })),
    keepIdle, discardIdle, takeBreak, simulateIdle,
  };
  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const value = useContext(TimerContext);
  if (!value) throw new Error("useTimer must be used inside TimerProvider");
  return value;
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
