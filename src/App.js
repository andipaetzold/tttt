import { useCallback, useEffect, useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { speakCommand } from "./speech";

export default function App() {
  const [startTime, setStartTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [timePerAthlete, setTimePerAthlete] = useState(10);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [timeUntilNextAthlete, setTimeUntilNextAthlete] = useState(0);

  const handleStart = () => {
    setStartTime(Date.now());
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

    let lastTotalAthleteIndex = 0;
    let lastTimeUntilNextAthlete = undefined;

    const tick = () => {
      const now = Date.now();

      const secondsSinceStart = Math.round((now - startTime) / 1_000);
      const totalAthleteIndex = Math.floor(secondsSinceStart / timePerAthlete);

      const newTimeUntilNextAthlete =
        timePerAthlete - (secondsSinceStart % timePerAthlete);

      if (newTimeUntilNextAthlete !== lastTimeUntilNextAthlete) {
        if (newTimeUntilNextAthlete >= lastTimeUntilNextAthlete) {
          for (let i = lastTimeUntilNextAthlete - 1; i >= 0; --i) {
            speakCommandIfEnabled(i);
          }
          for (let i = timePerAthlete; i >= newTimeUntilNextAthlete; --i) {
            speakCommandIfEnabled(i);
          }
        } else {
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
  }, [running, startTime, timePerAthlete, speakCommandIfEnabled]);

  return (
    <Container>
      <h1>Team Time Trial Timer</h1>

      <Card className="mb-2">
        <Card.Body>
          {running && <h2>Wechsel in {timeUntilNextAthlete}s</h2>}

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
          <Form.Group>
            <Form.Label>Interval (in Sekunden)</Form.Label>
            <Form.Control
              type="number"
              value={timePerAthlete}
              onChange={(e) => setTimePerAthlete(+e.target.value)}
            />
          </Form.Group>
          <Form.Group>
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
