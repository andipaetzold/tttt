import { DEFAULT_ATHLETE_NAMES, DEFAULT_SPEECH_ENABLED, DEFAULT_START_DELAY, DEFAULT_TIME_PER_ATHLETE } from "./constants";

const LOCAL_STORAGE_KEY = "config";

const DEFAULT_ATHLETES = DEFAULT_ATHLETE_NAMES.slice(0, 6).map((athleteName) => ({
    text: athleteName,
    enabled: true,
    time: DEFAULT_TIME_PER_ATHLETE,
}));

export function loadConfig() {
    try {
        const rawConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
        const config = JSON.parse(rawConfig);

        return {
            athletes: config.athletes || DEFAULT_ATHLETES,
            speechEnabled: config.speechEnabled,
            startDelay: config.startDelay,
        };
    } catch {
        return {
            athletes: DEFAULT_ATHLETES,
            speechEnabled: DEFAULT_SPEECH_ENABLED,
            startDelay: DEFAULT_START_DELAY,
        };
    }
}

export function saveConfig(config) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
}
