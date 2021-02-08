const voiceCommands = {
    voiceChanged: () => "Go faster!",
    start: () => "Start",
    15: ({ nextAthlete }) => `${nextAthlete}. Get ready.`,
    10: () => "Change in 10",
    5: () => "Five",
    2: () => "Two",
    1: () => "One",
    0: ({ nextAthlete }) => `Change to ${nextAthlete}`,
};

export function speakCommand(command, args, voice) {
    if (voiceCommands[command]) {
        speak(voiceCommands[command](args), voice);
    }
}

export function speak(text, voice) {
    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.lang = "en-US";
    msg.voice = voice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
}
