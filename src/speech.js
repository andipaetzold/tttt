const voiceCommands = {
  5: "Fünf Sekunden",
  2: "Zwei",
  1: "Eins",
  0: "Wechsel",
};

export function speakCommand(command) {
  if (voiceCommands[command]) {
    speak(voiceCommands[command]);
  }
}

export function speak(text) {
  const msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.lang = "de-DE";

  speechSynthesis.speak(msg);
}
