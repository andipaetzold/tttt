import { useEffect, useState } from "react";

export function useVoices() {
    const [voices, setVoices] = useState([]);

    const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
    };

    useEffect(() => {
        if (typeof window.speechSynthesis === "undefined") {
            return;
        }

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
        return () => (window.speechSynthesis.onvoiceschanged = undefined);
    }, []);

    return voices.filter((voice) => voice.lang.startsWith("en-"));
}
