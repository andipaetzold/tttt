import useInterval from "@use-it/interval";
import { useRef, useState } from "react";
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

const DEFAULT_TIME_PER_ATHLETE = 30;
const DEFAULT_ATHLETES = [
  "Anton",
  "Berta",
  "Cäsar",
  "Dora",
  "Emil",
  "Friedrich",
];
const DEFAULT_SPEECH_ENABLED = false;

export default function App() {
  const [startTime, setStartTime] = useState(0);
  const [running, setRunning] = useState(false);

  const [timePerAthlete, setTimePerAthlete] = useState(
    DEFAULT_TIME_PER_ATHLETE
  );
  const [speechEnabled, setSpeechEnabled] = useState(DEFAULT_SPEECH_ENABLED);
  const [athletes, setAthletes] = useState(
    DEFAULT_ATHLETES.map((athlete) => ({ text: athlete, enabled: true }))
  );

  const [timeUntilNextAthlete, setTimeUntilNextAthlete] = useState(0);
  const [currentAthlete, setCurrentAthlete] = useState(0);

  const athletesWithIndex = athletes.map((a, ai) => ({ ...a, index: ai }));
  const nextAthlete = [
    ...athletesWithIndex.slice(currentAthlete + 1),
    ...athletesWithIndex,
  ].filter((a) => a.enabled)[0].index;

  const prevTimeRef = useRef();

  useInterval(() => {
    if (!running) {
      return;
    }

    const now = Date.now();

    const secondsSinceStart = toSeconds(now - startTime);
    const prevSecondsSinceStart = toSeconds(prevTimeRef.current - startTime);

    setTimeUntilNextAthlete(Math.max(timePerAthlete - secondsSinceStart, 0));

    if (secondsSinceStart !== prevSecondsSinceStart) {
      if (secondsSinceStart >= timePerAthlete) {
        if (speechEnabled) {
          speakCommand(0, { nextAthlete: athletes[nextAthlete].text });
        }

        setCurrentAthlete(nextAthlete);
        setStartTime(now);
      } else {
        if (speechEnabled) {
          speakCommand(timePerAthlete - secondsSinceStart, {
            nextAthlete: athletes[nextAthlete].text,
          });
        }
      }
    }

    prevTimeRef.current = now;
  }, 500);

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now);
    prevTimeRef.current = now;
    setTimeUntilNextAthlete(timePerAthlete);

    setCurrentAthlete(0);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
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
                {athletes[currentAthlete].text}
              </h1>

              <h2 className="text-center display-5">
                🔜 {athletes[nextAthlete].text}
              </h2>

              <h3 className="text-center display-6">
                ⏱️ {timeUntilNextAthlete}s
              </h3>
              <ProgressBar
                style={{ transform: "scaleX(-1)", background: "white" }}
                now={timeUntilNextAthlete}
                max={timePerAthlete}
              />
            </>
          )}

          <div className="mt-4 text-center">
            {running ? (
              <Button variant="secondary" onClick={handleStop}>
                Stop
              </Button>
            ) : (
              <Button variant="primary" onClick={handleStart}>
                Start
              </Button>
            )}
          </div>
        </Jumbotron>

        <Card>
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
                    <InputGroup.Prepend>
                      <InputGroup.Text>#{athleteIndex + 1}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      type="text"
                      placeholder={`Athlete ${athleteIndex + 1}`}
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
            <Form.Group controlId="timePerAthlete">
              <Form.Label>Interval (in Seconds)</Form.Label>
              <Form.Control
                type="number"
                value={timePerAthlete}
                onChange={(e) => setTimePerAthlete(+e.target.value)}
                disabled={running}
                min={20}
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
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

function toSeconds(ms) {
  return Math.round(ms / 1_000);
}
