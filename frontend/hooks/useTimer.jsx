"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSubscription } from "@/lib/subscription";
import { useIdleDetector } from "./useIdleDetector";
import { getOpenActivity, heartbeatActivity, pauseActivity, resumeActivity, setActivityIdle, startActivity, stopActivity, updateActivityCategory, updateActivityTask, } from "@/lib/api";
const TimerContext = createContext(null);
const initial = { status: "stopped", elapsed: 0, idle: 0, startedAt: null, task: "Product strategy", category: "Productive", lastSession: 0, sessionId: null };
const keypressOptInKey = (userId) => `calmwork:keypress-counting:${userId}`;
const keypressCountKey = (sessionId) => `calmwork:keypress-count:${sessionId}`;
const currentElapsed = (data) => data.elapsed + (data.status === "running" && data.startedAt ? (Date.now() - data.startedAt) / 1000 : 0);
const settled = (data) => ({ ...data, elapsed: currentElapsed(data), startedAt: data.status === "running" ? Date.now() : null });
function reportFailure(error) {
    const message = error instanceof Error ? error.message : "The activity request failed.";
    window.dispatchEvent(new CustomEvent("calmwork:api-error", { detail: message }));
}
export function TimerProvider({ children }) {
    const { authenticated, canUseApp, user } = useSubscription();
    const [data, setData] = useState(initial);
    const dataRef = useRef(data);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [threshold, setThreshold] = useState(5);
    const [idleOpen, setIdleOpen] = useState(false);
    const [idleDuration, setIdleDuration] = useState(0);
    const [keypressCounting, setKeypressCounting] = useState(false);
    const [keypressCount, setKeypressCount] = useState(0);
    const keypressCountRef = useRef(0);
    const pendingStart = useRef(false);
    useEffect(() => {
        setData(initial);
        dataRef.current = initial;
        setElapsedSeconds(0);
        setThreshold(Math.min(30, Math.max(1, Number(localStorage.getItem("calmwork:idleThreshold")) || 5)));
        const settings = () => setThreshold(Math.min(30, Math.max(1, Number(localStorage.getItem("calmwork:idleThreshold")) || 5)));
        const resetPreferences = () => {
            setKeypressCounting(false);
            keypressCountRef.current = 0;
            setKeypressCount(0);
        };
        window.addEventListener("calmwork:settings", settings);
        window.addEventListener("calmwork:preferences-reset", resetPreferences);
        return () => {
            window.removeEventListener("calmwork:settings", settings);
            window.removeEventListener("calmwork:preferences-reset", resetPreferences);
        };
    }, []);
    useEffect(() => {
        setKeypressCounting(user?.id ? localStorage.getItem(keypressOptInKey(user.id)) === "true" : false);
    }, [user?.id]);
    useEffect(() => {
        setData(initial);
        dataRef.current = initial;
        setElapsedSeconds(0);
        if (!authenticated || !canUseApp || !user)
            return;
        let active = true;
        getOpenActivity().then((session) => {
            if (!active || !session)
                return;
            const startedAt = new Date(session.startedAt).getTime();
            const pausedAt = session.status === "running" || !session.pausedAt
                ? Date.now()
                : new Date(session.pausedAt).getTime();
            const elapsedFromSession = Math.max(0, Math.floor((pausedAt - startedAt) / 1000) - (session.pausedSeconds ?? 0));
            const current = dataRef.current;
            const elapsed = current.sessionId === session.id && current.status !== "stopped"
                ? current.elapsed
                : Math.max(elapsedFromSession, session.activeSeconds + session.idleSeconds);
            const next = {
                ...current,
                status: session.status,
                elapsed,
                idle: session.idleSeconds,
                startedAt: session.status === "running" ? Date.now() : null,
                task: session.task,
                category: session.category,
                sessionId: session.id,
            };
            setData(next);
            setElapsedSeconds(currentElapsed(next));
        }).catch(reportFailure);
        return () => { active = false; };
    }, [authenticated, canUseApp, user?.id]);
    useEffect(() => { dataRef.current = data; }, [data]);
    useEffect(() => {
        if (!data.sessionId) {
            keypressCountRef.current = 0;
            setKeypressCount(0);
            return;
        }
        const savedCount = Number(localStorage.getItem(keypressCountKey(data.sessionId))) || 0;
        keypressCountRef.current = savedCount;
        setKeypressCount(savedCount);
    }, [data.sessionId]);
    useEffect(() => {
        if (!keypressCounting || data.status !== "running" || !data.sessionId)
            return;
        const onKeydown = () => {
            if (document.hidden)
                return;
            const nextCount = keypressCountRef.current + 1;
            keypressCountRef.current = nextCount;
            localStorage.setItem(keypressCountKey(data.sessionId), String(nextCount));
            setKeypressCount(nextCount);
        };
        document.addEventListener("keydown", onKeydown);
        return () => document.removeEventListener("keydown", onKeydown);
    }, [keypressCounting, data.status, data.sessionId]);
    useEffect(() => {
        const interval = window.setInterval(() => setElapsedSeconds(currentElapsed(dataRef.current)), 1000);
        return () => window.clearInterval(interval);
    }, []);
    const start = useCallback(() => {
        if (pendingStart.current || dataRef.current.status === "running")
            return;
        pendingStart.current = true;
        void (async () => {
            try {
                const current = dataRef.current;
                const session = current.sessionId && current.status === "paused"
                    ? await resumeActivity(current.sessionId).then(() => ({ _id: current.sessionId }))
                    : await startActivity(current.task, current.category).then((result) => result.session);
                const next = { ...dataRef.current, status: "running", startedAt: Date.now(), sessionId: session._id };
                setData(next);
            }
            catch (error) {
                reportFailure(error);
            }
            finally {
                pendingStart.current = false;
            }
        })();
    }, []);
    const pause = useCallback(() => {
        const current = dataRef.current;
        if (current.status !== "running")
            return;
        void (async () => {
            try {
                if (current.sessionId)
                    await pauseActivity(current.sessionId);
                setData((prev) => ({ ...settled(prev), status: "paused", startedAt: null }));
            }
            catch (error) {
                reportFailure(error);
            }
        })();
    }, []);
    const stop = useCallback(() => {
        const current = dataRef.current;
        if (current.status === "stopped")
            return;
        void (async () => {
            try {
                if (current.sessionId)
                    await stopActivity(current.sessionId);
                if (current.sessionId)
                    localStorage.removeItem(keypressCountKey(current.sessionId));
                keypressCountRef.current = 0;
                setKeypressCount(0);
                setData((prev) => ({
                    ...prev,
                    status: "stopped",
                    elapsed: 0,
                    startedAt: null,
                    lastSession: currentElapsed(prev),
                    sessionId: null,
                }));
            }
            catch (error) {
                reportFailure(error);
            }
        })();
    }, []);
    useEffect(() => {
        const visibility = () => {
            if (document.hidden && dataRef.current.status === "running")
                pause();
        };
        const pagehide = () => {
            if (dataRef.current.status === "running" && dataRef.current.sessionId) {
                void heartbeatActivity(dataRef.current.sessionId).catch(reportFailure);
            }
        };
        document.addEventListener("visibilitychange", visibility);
        window.addEventListener("pagehide", pagehide);
        return () => { document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pagehide", pagehide); };
    }, [pause]);
    useEffect(() => {
        if (data.status !== "running" || !data.sessionId)
            return;
        const timer = window.setInterval(() => { void heartbeatActivity(data.sessionId).catch(reportFailure); }, 15_000);
        return () => window.clearInterval(timer);
    }, [data.status, data.sessionId]);
    const idleHandler = useCallback((seconds) => {
        setIdleDuration(seconds);
        setIdleOpen(true);
        if (dataRef.current.sessionId)
            void setActivityIdle(dataRef.current.sessionId, true).catch(reportFailure);
    }, []);
    const { resetActivity, simulateIdle } = useIdleDetector(threshold, data.status === "running" && !idleOpen, idleHandler);
    const closeIdle = useCallback(() => { setIdleOpen(false); resetActivity(); }, [resetActivity]);
    const setKeypressCountingOptIn = useCallback((enabled) => {
        if (!user?.id)
            return;
        localStorage.setItem(keypressOptInKey(user.id), String(enabled));
        if (!enabled) {
            if (dataRef.current.sessionId)
                localStorage.removeItem(keypressCountKey(dataRef.current.sessionId));
            keypressCountRef.current = 0;
            setKeypressCount(0);
        }
        setKeypressCounting(enabled);
    }, [user?.id]);
    const setTask = useCallback((task) => {
        const current = dataRef.current;
        if (current.task === task)
            return;
        const next = { ...current, task };
        dataRef.current = next;
        setData(next);
        if (!current.sessionId || current.status === "stopped")
            return;
        void updateActivityTask(current.sessionId, task).catch((error) => {
            reportFailure(error);
            setData((prev) => {
                if (prev.sessionId !== current.sessionId || prev.task !== task)
                    return prev;
                const restored = { ...prev, task: current.task };
                dataRef.current = restored;
                return restored;
            });
        });
    }, []);
    const keepIdle = useCallback(() => {
        if (dataRef.current.sessionId)
            void setActivityIdle(dataRef.current.sessionId, false).catch(reportFailure);
        closeIdle();
    }, [closeIdle]);
    const discardIdle = useCallback(() => {
        if (dataRef.current.sessionId)
            void setActivityIdle(dataRef.current.sessionId, false).catch(reportFailure);
        setData((prev) => {
            const next = settled(prev);
            return { ...next, elapsed: Math.max(0, next.elapsed - idleDuration), idle: next.idle + idleDuration };
        });
        closeIdle();
    }, [closeIdle, idleDuration]);
    const takeBreak = useCallback(() => {
        const current = dataRef.current;
        if (current.sessionId)
            void Promise.all([
                setActivityIdle(current.sessionId, false),
                pauseActivity(current.sessionId),
            ]).catch(reportFailure);
        setData((prev) => {
            const next = settled(prev);
            return { ...next, status: "paused", startedAt: null, elapsed: Math.max(0, next.elapsed - idleDuration), idle: next.idle + idleDuration };
        });
        closeIdle();
    }, [closeIdle, idleDuration]);
    const value = {
        ...data, elapsedSeconds, idleOpen, idleDuration, start, pause, stop,
        keypressCounting, keypressCount, setKeypressCounting: setKeypressCountingOptIn,
        setTask,
        setCategory: (category) => {
            setData((prev) => ({ ...prev, category }));
            if (dataRef.current.sessionId)
                void updateActivityCategory(dataRef.current.sessionId, category).catch(reportFailure);
        },
        keepIdle, discardIdle, takeBreak, simulateIdle,
    };
    return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}
export function useTimer() {
    const value = useContext(TimerContext);
    if (!value)
        throw new Error("useTimer must be used inside TimerProvider");
    return value;
}
export function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
