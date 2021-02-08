import { Button, Form } from "react-bootstrap";
import { speakCommand } from "../common/speech";

export function VoiceSettings({ voices, voice, onChange }) {
    const handleChange = (e) => {
        const newVoiceURI = e.target.value;
        const newVoice = voices.find((v) => v.voiceURI === newVoiceURI);

        if (!newVoice) {
            return;
        }

        speakCommand("voiceChanged", {}, newVoice);
        onChange(newVoice);
    };
    return (
        <Form.Group controlId="voice">
            <Form.Label>Voice</Form.Label>
            <Form.Control as="select" onChange={handleChange} value={voice?.voiceURI} disabled={voices.length === 0}>
                {voices.length > 0 ? (
                    voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name}
                        </option>
                    ))
                ) : (
                    <option key="default">Default</option>
                )}
            </Form.Control>
            <Form.Text>
                If the voice output does not work anymore, click{" "}
                <Button
                    style={{
                        padding: 0,
                        fontSize: "100%",
                        border: "none",
                    }}
                    variant="link"
                    onClick={() => {
                        onChange(undefined);

                        // make sure the changes are saved to local storage
                        setTimeout(() => {
                            window.location.reload();
                        }, 0);
                    }}
                >
                    here
                </Button>{" "}
                to reset the app and keep the default voice.
            </Form.Text>
        </Form.Group>
    );
}
