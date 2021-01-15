import { useEffect, useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { speak } from "./speech";

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

  useEffect(() => {
    if (!running) {
      return;
    }

    let lastTotalAthleteIndex = 0;
    const tick = () => {
      const now = Date.now();

      const secondsSinceStart = Math.round((now - startTime) / 1_000);
      const totalAthleteIndex = Math.floor(secondsSinceStart / timePerAthlete);

      if (totalAthleteIndex !== lastTotalAthleteIndex) {
        lastTotalAthleteIndex = totalAthleteIndex;

        if (speechEnabled) {
          speak("Wechsel");
        }
      }

      setTimeUntilNextAthlete(
        timePerAthlete - (secondsSinceStart % timePerAthlete)
      );
    };

    tick();

    const timeout = setInterval(tick, 1_000);
    return () => clearTimeout(timeout);
  }, [running, startTime, timePerAthlete, speechEnabled]);

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
