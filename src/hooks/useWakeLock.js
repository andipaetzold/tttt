import { useEffect, useRef } from "react";

const isSupported = "wakeLock" in navigator;

export function useWakeLock(active) {
    const wakelockRef = useRef(null);

    useEffect(() => {
        if (!isSupported) {
            return;
        }

        if (!active) {
            return;
        }

        const release = async () => {
            await wakelockRef.current?.release();
            wakelockRef.current = null;
        };

        const request = async () => {
            if (document.visibilityState !== "visible") {
                return;
            }

            try {
                await release();
                wakelockRef.current = await navigator.wakeLock.request("screen");
            } catch {}
        };

        request();
        document.addEventListener("visibilitychange", request);

        return () => {
            release();
            document.removeEventListener("visibilitychange", request);
        };
    }, [active]);
}
