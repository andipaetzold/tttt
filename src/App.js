import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { speakCommand } from "./speech";

let lastTimeUntilNextAthlete = undefined;

export default function App() {
  const [startTime, setStartTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [timePerAthlete, setTimePerAthlete] = useState(10);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [timeUntilNextAthlete, setTimeUntilNextAthlete] = useState(0);
  const [athletes, setAthletes] = useState(["A", "B", "C", "D", "E", "F"]);
  const [currentAthlete, setCurrentAthlete] = useState(0);
  const [nextAthlete, setNextAthlete] = useState(1);

  const handleStart = () => {
    setStartTime(Date.now());
    setCurrentAthlete(0);
    setNextAthlete(1);
    setRunning(true);
  };

  const speakCommandIfEnabled = useCallback(
    (command) => {
      if (speechEnabled) {
        speakCommand(command);
      }
    },
    [speechEnabled]
  );

  useEffect(() => {
    if (!running) {
      return;
    }

    const tick = () => {
      const now = Date.now();

      const secondsSinceStart = Math.round((now - startTime) / 1_000);

      const newTimeUntilNextAthlete =
        timePerAthlete - (secondsSinceStart % timePerAthlete);

      if (lastTimeUntilNextAthlete === undefined) {
        lastTimeUntilNextAthlete = newTimeUntilNextAthlete;
      } else if (newTimeUntilNextAthlete !== lastTimeUntilNextAthlete) {
        if (newTimeUntilNextAthlete >= lastTimeUntilNextAthlete) {
          // Next athlete
          setCurrentAthlete((cur) => (cur + 1) % athletes.length);
          setNextAthlete((cur) => (cur + 1) % athletes.length);

          // Commands
          for (let i = lastTimeUntilNextAthlete - 1; i >= 0; --i) {
            speakCommandIfEnabled(i);
          }
          for (let i = timePerAthlete; i >= newTimeUntilNextAthlete; --i) {
            speakCommandIfEnabled(i);
          }
        } else {
          // Commands
          for (
            let i = lastTimeUntilNextAthlete - 1;
            i >= newTimeUntilNextAthlete;
            --i
          ) {
            speakCommandIfEnabled(i);
          }
        }

        lastTimeUntilNextAthlete = newTimeUntilNextAthlete;
      }

      setTimeUntilNextAthlete(newTimeUntilNextAthlete);
    };

    tick();

    const timeout = setInterval(tick, 1_000);
    return () => clearTimeout(timeout);
  }, [
    running,
    startTime,
    timePerAthlete,
    speakCommandIfEnabled,
    athletes.length,
    nextAthlete,
    currentAthlete,
  ]);

  return (
    <Container>
      <h1>Team Time Trial Timer</h1>

      <Card className="mb-2">
        <Card.Body>
          {running && (
            <>
              <h2>
                {athletes[currentAthlete]} → {athletes[nextAthlete]}
              </h2>
              <h3>Wechsel in {timeUntilNextAthlete}s</h3>
            </>
          )}

          <div className="mt-4">
            {running ? (
              <Button variant="secondary" onClick={() => setRunning(false)}>
                Stop
              </Button>
            ) : (
              <Button variant="primary" onClick={handleStart}>
                Start
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h3>Sportler</h3>

          {athletes.map((athlete, athleteIndex) => (
            <Form.Group
              key={athleteIndex}
              as={Row}
              controlId={`athlete-${athleteIndex}`}
            >
              <Form.Label column sm={2}>
                #{athleteIndex + 1}
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type="text"
                  placeholder={`Athlete ${athleteIndex}`}
                  value={athlete}
                  onChange={(e) =>
                    setAthletes(
                      athletes.map((a, ai) =>
                        ai === athleteIndex ? e.target.value : a
                      )
                    )
                  }
                />
              </Col>
            </Form.Group>
          ))}

          <h3>Einstellungen</h3>
          <Form.Group controlId="timePerAthlete">
            <Form.Label>Interval (in Sekunden)</Form.Label>
            <Form.Control
              type="number"
              value={timePerAthlete}
              onChange={(e) => setTimePerAthlete(+e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="speechEnabled">
            <Form.Check
              type="checkbox"
              label="Sprachausgabe"
              checked={speechEnabled}
              onChange={(e) => setSpeechEnabled(e.target.checked)}
            />
          </Form.Group>
        </Card.Body>
      </Card>
    </Container>
  );
}
