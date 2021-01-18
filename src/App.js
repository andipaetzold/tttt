import useInterval from "@use-it/interval";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Jumbotron,
  Navbar,
  ProgressBar,
  Row,
  ToggleButton,
} from "react-bootstrap";
import { speakCommand } from "./speech";
import { loadConfig, saveConfig } from "./config";
import { useVoices } from "./useVoices";

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

  useInterval(() => {
    if (!running) {
      return;
    }

    const changeTime =
      currentAthlete === undefined ? startDelay : athletes[currentAthlete].time;

    const now = Date.now();

    const secondsSinceStart = toSeconds(now - startTime);
    const prevSecondsSinceStart = toSeconds(prevTimeRef.current - startTime);

    setTimeUntilNextChange(Math.max(changeTime - secondsSinceStart, 0));

    if (secondsSinceStart !== prevSecondsSinceStart) {
      if (secondsSinceStart >= changeTime) {
        if (speechEnabled) {
          if (currentAthlete === undefined) {
            speak("start");
          } else {
            speak(0);
          }
        }

        setCurrentAthlete(nextAthlete);
        setStartTime(now);
      } else {
        if (speechEnabled) {
          speak(changeTime - secondsSinceStart);
        }
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

  const handleVoiceChange = (newVoiceURI) => {
    setVoiceURI(newVoiceURI);

    // do not use `speak` here as it would use the old voice state
    speakCommand(
      "voiceChanged",
      {},
      voices.find((v) => v.voiceURI === newVoiceURI)
    );
  };

  return (
    <>
      <Navbar bg="light" className="mb-2">
        <Container>
          <Navbar.Brand>Team Time Trial Timer</Navbar.Brand>
        </Container>
      </Navbar>

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
            <h3>Athletes</h3>

            {athletes.map((athlete, athleteIndex) => (
              <Form.Group
                key={athleteIndex}
                as={Row}
                controlId={`athlete-${athleteIndex}`}
              >
                <Col sm={12}>
                  <InputGroup>
                    <Form.Control
                      style={{ background: !athlete.enabled && "#6c757d80" }}
                      type="text"
                      placeholder={`Name`}
                      value={athlete.text}
                      onChange={(e) =>
                        setAthletes(
                          athletes.map((a, ai) =>
                            ai === athleteIndex
                              ? { ...a, text: e.target.value }
                              : a
                          )
                        )
                      }
                    />
                    <Form.Control
                      style={{ background: !athlete.enabled && "#6c757d80" }}
                      type="number"
                      placeholder={`Time (in seconds)`}
                      value={athlete.time}
                      onChange={(e) =>
                        setAthletes(
                          athletes.map((a, ai) =>
                            ai === athleteIndex
                              ? { ...a, time: +e.target.value }
                              : a
                          )
                        )
                      }
                    />
                    <InputGroup.Append>
                      <ButtonGroup toggle>
                        <ToggleButton
                          variant="outline-secondary"
                          type="checkbox"
                          name={`athlete-${athleteIndex}-enabled`}
                          checked={!athlete.enabled}
                          disabled={
                            athlete.enabled &&
                            athletes.filter((a) => a.enabled).length === 1
                          }
                          onChange={(e) =>
                            setAthletes(
                              athletes.map((a, ai) =>
                                ai === athleteIndex
                                  ? { ...a, enabled: !e.target.checked }
                                  : a
                              )
                            )
                          }
                        >
                          ☠️
                        </ToggleButton>
                      </ButtonGroup>
                    </InputGroup.Append>
                  </InputGroup>
                </Col>
              </Form.Group>
            ))}

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
            <Form.Group controlId="voice">
              <Form.Label>Voice</Form.Label>
              <Form.Control
                as="select"
                onChange={(e) => handleVoiceChange(e.target.value)}
                value={voiceURI}
                disabled={voices.length === 0}
              >
                {voices.length > 0 ? (
                  voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name}
                    </option>
                  ))
                ) : (
                  <option key="default">Default</option>
                )}
              </Form.Control>
            </Form.Group>
          </Card.Body>
        </Card>

        <footer className="text-muted mb-2">
          <a
            href="https://github.com/andipaetzold/tttt"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>{" "}
          | Made with ♥ for{" "}
          <a
            href="https://www.wtrl.racing"
            rel="noopener noreferrer"
            target="_blank"
          >
            WTRL
          </a>{" "}
          by{" "}
          <a
            href="https://zwiftpower.com/profile.php?z=1861132"
            rel="noopener noreferrer"
            target="_blank"
          >
            Andi P&auml;tzold
          </a>
        </footer>
      </Container>
    </>
  );
}

function toSeconds(ms) {
  return Math.round(ms / 1_000);
}
