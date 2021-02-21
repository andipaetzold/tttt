export interface Athlete {
    text: string;
    time: number;
    enabled: boolean;
}

export type State = "stopped" | "running" | "paused";

export interface Round {
    timePassed: number;
    totalTime: number;
    currentAthlete: number | undefined; // undefined = startDelay
}
