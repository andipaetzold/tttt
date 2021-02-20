/// <reference types="react-scripts" />

interface Navigator {
    wakeLock: {
        request: (type: "screen") => Promise<WakeLock>;
    };
}

interface WakeLock {
    release: () => Promise<void>;
}
