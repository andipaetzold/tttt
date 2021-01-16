import { useEffect, useState } from "react";

export function useVoices() {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    return () => (window.speechSynthesis.onvoiceschanged = undefined);
  }, []);

  return voices.filter((voice) => voice.lang.startsWith("en-"));
}
