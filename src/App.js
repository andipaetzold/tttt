import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { speakCommand } from "./speech";

let prevTickTime = undefined;

export default function App() {
  const [startTime, setStartTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [timePerAthlete, setTimePerAthlete] = useState(30);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [timeUntilNextAthlete, setTimeUntilNextAthlete] = useState(0);
  const [athletes, setAthletes] = useState([
    "Anton",
    "Berta",
    "Cäsar",
    "Dora",
    "Emil",
    "Friedrich",
  ]);
  const [currentAthlete, setCurrentAthlete] = useState(0);
  const [nextAthlete, setNextAthlete] = useState(1);

  useEffect(() => {
    if (!running) {
      return;
    }

    const tick = () => {
      const now = Date.now();

      const secondsSinceStart = Math.round((now - startTime) / 1_000);
      const newTimeUntilNextAthlete =
        timePerAthlete - (secondsSinceStart % timePerAthlete);

      setTimeUntilNextAthlete(newTimeUntilNextAthlete);

      if (prevTickTime !== undefined) {
        const prevSecondsSinceStart = Math.round(
          (prevTickTime - startTime) / 1_000
        );
        const prevTimeUntilNextAthlete =
          timePerAthlete - (prevSecondsSinceStart % timePerAthlete);

        if (newTimeUntilNextAthlete !== prevTimeUntilNextAthlete) {
          if (newTimeUntilNextAthlete >= prevTimeUntilNextAthlete) {
            if (speechEnabled) {
              speakCommand(0, { nextAthlete: athletes[nextAthlete] });
            }

            setCurrentAthlete((cur) => (cur + 1) % athletes.length);
            setNextAthlete((cur) => (cur + 1) % athletes.length);
          } else if (newTimeUntilNextAthlete > 0) {
            if (speechEnabled) {
              speakCommand(newTimeUntilNextAthlete, {
                nextAthlete: athletes[nextAthlete],
              });
            }
          }
        }
      }
      prevTickTime = now;
    };

    tick();
    const handle = setInterval(tick, 500);
    return () => clearInterval(handle);
  }, [running, speechEnabled, athletes, nextAthlete, timePerAthlete, startTime]);

  const handleStart = () => {
    setStartTime(Date.now());
    setCurrentAthlete(0);
    setNextAthlete(1);

    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

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
              <Button variant="secondary" onClick={handleStop}>
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
              disabled={running}
              min={20}
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
