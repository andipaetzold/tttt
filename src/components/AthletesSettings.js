import {
  ButtonGroup,
  Col,
  Form,
  InputGroup,
  Row,
  ToggleButton,
} from "react-bootstrap";

export function AthletesSettings({ athletes, onChange }) {
  return (
    <>
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
                placeholder="Name"
                value={athlete.text}
                onChange={(e) =>
                  onChange(
                    athletes.map((a, ai) =>
                      ai === athleteIndex ? { ...a, text: e.target.value } : a
                    )
                  )
                }
              />
              <Form.Control
                style={{ background: !athlete.enabled && "#6c757d80" }}
                type="number"
                placeholder="Time (in seconds)"
                min={1}
                value={athlete.time}
                onChange={(e) =>
                  onChange(
                    athletes.map((a, ai) =>
                      ai === athleteIndex ? { ...a, time: +e.target.value } : a
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
                      onChange(
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
    </>
  );
}
