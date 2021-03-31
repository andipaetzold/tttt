interface Args {
    nextAthlete: string;
    started: boolean;
}

const voiceCommands: Record<string, (args: Args) => string> = {
    [10 * 60]: () => "10 minutes",
    [5 * 60]: () => "5 minutes",
    [3 * 60]: () => "3 minutes",
    [2 * 60]: () => "2 minutes",
    [1 * 60]: () => "1 minute",
    30: () => "30 seconds",
    15: ({ nextAthlete }) => `${nextAthlete}. Get ready.`,
    10: ({ started }) => (started ? "Change in 10" : "Start in 10"),
    5: () => "Five",
    2: () => "Two",
    1: () => "One",
    0: ({ nextAthlete, started }) => (started ? `Change to ${nextAthlete}` : "Let's go"),
    skip: ({ nextAthlete }) => `Go ${nextAthlete}!`,
};

export function speakCommand(command: string, args: Args) {
    if (voiceCommands[command]) {
        speak(voiceCommands[command](args));
    }
}

export function speak(text: string) {
    if (!isSpeechSupported) {
        return;
    }

    const msg = new window.SpeechSynthesisUtterance();
    msg.text = text;
    msg.lang = "en-US";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
}

export const isSpeechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
