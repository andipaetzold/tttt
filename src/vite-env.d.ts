/// <reference types="vite/client" />

interface Navigator {
  wakeLock: {
    request: (type: "screen") => Promise<WakeLock>;
  };
}

interface WakeLock {
  release: () => Promise<void>;
}
