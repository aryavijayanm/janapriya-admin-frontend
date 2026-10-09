"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const TAP_WINDOW_MS = 800;
const TAPS_REQUIRED = 2;

// No visual output -- just attaches global keyboard listeners for as long as
// it's mounted. Trigger: 2 standalone Ctrl taps (pressed and released with no
// other key touched while held) within TAP_WINDOW_MS, anywhere in the app.
export function PanicLogout() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const disqualifiedRef = useRef(false);
    const tapTimestampsRef = useRef<number[]>([]);

    useEffect(() => {
        if (!user) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key !== "Control") {
                // Some other key is held alongside Ctrl -- this hold is a
                // real combo (Ctrl+C, Ctrl+V, ...), not a lone tap.
                disqualifiedRef.current = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key !== "Control") return;

            const wasClean = !disqualifiedRef.current;
            disqualifiedRef.current = false;

            if (!wasClean) return;

            const now = Date.now();
            const recentTaps = tapTimestampsRef.current.filter(
                (t) => now - t < TAP_WINDOW_MS,
            );
            recentTaps.push(now);
            tapTimestampsRef.current = recentTaps;

            if (recentTaps.length >= TAPS_REQUIRED) {
                tapTimestampsRef.current = [];
                // Hide the screen first; the actual session invalidation can
                // finish in the background right after.
                router.push("/login");
                logout();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [user, router, logout]);

    return null;
}
