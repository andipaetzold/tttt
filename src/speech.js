const voiceCommands = {
  15: ({ nextAthlete }) => `${nextAthlete} bereit machen`,
  10: () => "Wechsel in 10",
  5: () => "Fünf",
  2: () => "Zwei",
  1: () => "Eins",
  0: ({ nextAthlete }) => `Wechsel auf ${nextAthlete}`,
};

export function speakCommand(command, args) {
  if (voiceCommands[command]) {
    speak(voiceCommands[command](args));
  }
}

export function speak(text) {
  const msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.lang = "de-DE";

  speechSynthesis.speak(msg);
}
