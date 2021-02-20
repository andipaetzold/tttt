import { faSkullCrossbones, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup, Col, Form, InputGroup, Row, ToggleButton } from "react-bootstrap";
import { DEFAULT_ATHLETE_NAMES, DEFAULT_TIME_PER_ATHLETE } from "../common/constants";
import { CopyButton } from "./CopyButton";

export function AthletesSettings({ athletes, onChange, started }) {
    const discordCommand = `!t config athletes ${athletes
        .map((athlete) => `${athlete.text.trim().replaceAll(" ", "_").replaceAll(" ", "_")}:${athlete.time}`)
        .join(" ")}`;

    const getBackgroundColor = (athleteIndex) => {
        if (!started) {
            return "#fff";
        }

        if (!athletes[athleteIndex].enabled) {
            return "#6c757d80";
        }

        return "#fff";
    };

    return (
        <>
            <h2 className="mb-3">
                Athletes <CopyButton command={discordCommand} />
            </h2>

            {athletes.map((athlete, athleteIndex) => (
                <Form.Group key={athleteIndex} as={Row} controlId={`athlete-${athleteIndex}`}>
                    <Col sm={12}>
                        <InputGroup>
                            <Form.Control
                                style={{ background: getBackgroundColor(athleteIndex) }}
                                type="text"
                                placeholder="Name"
                                value={athlete.text}
                                onChange={(e) =>
                                    onChange(
                                        athletes.map((a, ai) => (ai === athleteIndex ? { ...a, text: e.target.value } : a))
                                    )
                                }
                            />
                            <Form.Control
                                style={{ background: getBackgroundColor(athleteIndex) }}
                                type="number"
                                placeholder="Time (in seconds)"
                                min={5}
                                step={5}
                                value={athlete.time}
                                onChange={(e) =>
                                    onChange(
                                        athletes.map((a, ai) => (ai === athleteIndex ? { ...a, time: +e.target.value } : a))
                                    )
                                }
                            />
                            <InputGroup.Append>
                                <ButtonGroup toggle>
                                    {started && (
                                        <ToggleButton
                                            variant="outline-secondary"
                                            type="checkbox"
                                            name={`athlete-${athleteIndex}-enabled`}
                                            checked={!athlete.enabled}
                                            disabled={athlete.enabled && athletes.filter((a) => a.enabled).length === 1}
                                            onChange={(e) =>
                                                onChange(
                                                    athletes.map((a, ai) =>
                                                        ai === athleteIndex ? { ...a, enabled: !e.target.checked } : a
                                                    )
                                                )
                                            }
                                        >
                                            <FontAwesomeIcon icon={faSkullCrossbones} />
                                        </ToggleButton>
                                    )}
                                    {!started && (
                                        <Button
                                            variant="danger"
                                            disabled={athletes.length === 1}
                                            onClick={() => onChange(athletes.filter((_, ai) => ai !== athleteIndex))}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    )}
                                </ButtonGroup>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Form.Group>
            ))}

            {!started && (
                <Button
                    variant="light"
                    block
                    onClick={() => {
                        onChange([
                            ...athletes,
                            {
                                text: DEFAULT_ATHLETE_NAMES[athletes.length] ?? "",
                                time: DEFAULT_TIME_PER_ATHLETE,
                                enabled: true,
                            },
                        ]);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} /> Add athlete
                </Button>
            )}
        </>
    );
}
