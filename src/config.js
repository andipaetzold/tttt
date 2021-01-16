const LOCAL_STORAGE_KEY = "config";

const DEFAULT_START_DELAY = 0;
const DEFAULT_TIME_PER_ATHLETE = 30;
const DEFAULT_ATHLETE_NAMES = [
  "Amelia",
  "Bowie",
  "Coco",
  "Dan",
  "Emma",
  "Finn",
];
const DEFAULT_SPEECH_ENABLED = false;

const DEFAULT_ATHLETES = DEFAULT_ATHLETE_NAMES.map((athleteName) => ({
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
