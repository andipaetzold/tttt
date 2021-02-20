export interface Athlete {
    text: string;
    time: number;
    enabled: boolean;
}

export type State = "stopped" | "running" | "paused";
