export function speak(text) {
  const msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.lang = "de-DE";

  speechSynthesis.speak(msg);
}
