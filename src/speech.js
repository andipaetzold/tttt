const voiceCommands = {
  start: () => "Start",
  15: ({ nextAthlete }) => `${nextAthlete}. Get ready.`,
  10: () => "Change in 10",
  5: () => "Five",
  2: () => "Two",
  1: () => "One",
  0: ({ nextAthlete }) => `Change to ${nextAthlete}`,
};

export function speakCommand(command, args) {
  if (voiceCommands[command]) {
    speak(voiceCommands[command](args));
  }
}

export function speak(text) {
  const msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.lang = "en-US";

  speechSynthesis.speak(msg);
}
