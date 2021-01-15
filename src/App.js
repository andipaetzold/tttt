import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";

export default function App() {
  const [running, setRunning] = useState(false);
  const [timePerAthlete, setTimePerAthlete] = useState(30);
  const [speechEnabled, setSpeechEnabled] = useState(false);

  return (
    <Container>
      <h1>Team Time Trial Timer</h1>

      <Card className="mb-2">
        <Card.Body>
          {running ? (
            <Button variant="secondary" onClick={() => setRunning(false)}>
              Stop
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setRunning(true)}>
              Start
            </Button>
          )}
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
