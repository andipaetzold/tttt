import useInterval from "@use-it/interval";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  Jumbotron,
  ProgressBar,
} from "react-bootstrap";
import { loadConfig, saveConfig } from "../common/config";
import { speakCommand } from "../common/speech";
import { toSeconds } from "../common/util";
import { useVoices } from "../hooks/useVoices";
import { AthletesSettings } from "./AthletesSettings";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { VoiceSettings } from "./VoiceSettings";

const initialConfig = loadConfig();

export default function App() {
  const [startTime, setStartTime] = useState(0);
  const [running, setRunning] = useState(false);

  const [startDelay, setStartDelay] = useState(initialConfig.startDelay);
  const [speechEnabled, setSpeechEnabled] = useState(
    initialConfig.speechEnabled
  );
  const [athletes, setAthletes] = useState(initialConfig.athletes);

  const voices = useVoices();
  const [voiceURI, setVoiceURI] = useState(initialConfig.voice);
  const voice = voices.find((v) => v.voiceURI === voiceURI);

  const [timeUntilNextChange, setTimeUntilNextChange] = useState(0);
  const [currentAthlete, setCurrentAthlete] = useState(undefined);
  const currentAthleteName =
    currentAthlete !== undefined
      ? athletes[currentAthlete].text || `Athlete ${currentAthlete + 1}`
      : "";

  useEffect(() => {
    saveConfig({ athletes, startDelay, speechEnabled, voice: voiceURI });
  }, [athletes, startDelay, speechEnabled, voiceURI]);

  const nextAthlete = useMemo(() => {
    const athletesWithIndex = athletes.map((a, ai) => ({ ...a, index: ai }));

    if (currentAthlete === undefined) {
      return athletesWithIndex.find((a) => a.enabled).index;
    }

    return [
      ...athletesWithIndex.slice(currentAthlete + 1),
      ...athletesWithIndex,
    ].filter((a) => a.enabled)[0].index;
  }, [currentAthlete, athletes]);
  const nextAthleteName =
    athletes[nextAthlete].text || `Athlete ${nextAthlete + 1}`;

  const prevTimeRef = useRef();

  const speak = (command) => {
    if (!speechEnabled) {
      return;
    }
    speakCommand(command, { nextAthlete: nextAthleteName }, voice);
  };

  const changeToNextAthlete = () => {
    setCurrentAthlete(nextAthlete);
    setStartTime(Date.now());
    setTimeUntilNextChange(athletes[nextAthlete].time);
  };

  useInterval(() => {
    if (!running) {
      return;
    }

    const changeTime =
      currentAthlete === undefined ? startDelay : athletes[currentAthlete].time;

    const now = Date.now();

    const secondsSinceStart = toSeconds(now - startTime);
    const prevSecondsSinceStart = toSeconds(prevTimeRef.current - startTime);

    if (secondsSinceStart !== prevSecondsSinceStart) {
      if (secondsSinceStart >= changeTime) {
        speak(currentAthlete === undefined ? "start" : 0);
        changeToNextAthlete();
      } else {
        speak(changeTime - secondsSinceStart);
        setTimeUntilNextChange(Math.max(changeTime - secondsSinceStart, 0));
      }
    }

    prevTimeRef.current = now;
  }, 500);

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now);
    prevTimeRef.current = now;
    setTimeUntilNextChange(startDelay > 0 ? startDelay : athletes[0].time);
    setCurrentAthlete(startDelay > 0 ? undefined : nextAthlete);

    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  return (
    <>
      <Header />

      <Container>
        <Jumbotron className="mb-2">
          {running && (
            <>
              <h1 className="text-center display-2">
                {currentAthlete === undefined ? "Wait" : currentAthleteName}
              </h1>

              <h2 className="text-center display-5">🔜 {nextAthleteName}</h2>

              <h3 className="text-center display-6">
                ⏱️ {timeUntilNextChange}s
              </h3>
              <ProgressBar
                style={{ transform: "scaleX(-1)", background: "white" }}
                now={timeUntilNextChange}
                max={
                  currentAthlete === undefined
                    ? startDelay
                    : athletes[currentAthlete].time
                }
              />
            </>
          )}

          <div className="mt-4 text-center">
            {running ? (
              <Button variant="danger" onClick={handleStop}>
                Stop
              </Button>
            ) : (
              <Button variant="primary" onClick={handleStart} size="lg">
                Start
              </Button>
            )}
          </div>
        </Jumbotron>

        <Card className="mb-2">
          <Card.Body>
            <AthletesSettings athletes={athletes} onChange={setAthletes} />

            <h3>Settings</h3>
            <Form.Group controlId="startDelay">
              <Form.Label>Start Delay (in seconds)</Form.Label>
              <Form.Control
                type="number"
                value={startDelay}
                onChange={(e) => setStartDelay(+e.target.value)}
                disabled={running}
                min={0}
              />
            </Form.Group>

            <Form.Group controlId="speechEnabled">
              <Form.Check
                type="checkbox"
                label="Voice Output"
                checked={speechEnabled}
                onChange={(e) => setSpeechEnabled(e.target.checked)}
              />
            </Form.Group>
            <VoiceSettings
              voices={voices}
              voice={voice}
              onChange={(v) => setVoiceURI(v?.voiceURI)}
            />
          </Card.Body>
        </Card>

        <Footer />
      </Container>
    </>
  );
}
