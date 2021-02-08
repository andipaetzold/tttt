import { faClock } from "@fortawesome/free-regular-svg-icons";
import { faArrowRight, faForward, faPause, faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useInterval from "@use-it/interval";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Container, Form, Jumbotron, ProgressBar } from "react-bootstrap";
import { loadConfig, saveConfig } from "../common/config";
import { DEFAULT_ATHLETE_NAMES, DEFAULT_TIME_PER_ATHLETE } from "../common/constants";
import { speakCommand } from "../common/speech";
import { toSeconds } from "../common/util";
import { useVoices } from "../hooks/useVoices";
import { useWakeLock } from "../hooks/useWakeLock";
import { AthletesSettings } from "./AthletesSettings";
import { CopyButton } from "./CopyButton";
import { DiscordBot } from "./DiscordBot";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { VoiceSettings } from "./VoiceSettings";

const initialConfig = loadConfig();

export default function App() {
    const [state, setState] = useState("stopped");

    useWakeLock(state === "running" || state === "paused");

    const [startDelay, setStartDelay] = useState(initialConfig.startDelay);
    const [speechEnabled, setSpeechEnabled] = useState(initialConfig.speechEnabled);
    const [athletes, setAthletes] = useState(initialConfig.athletes);

    const getAthleteName = (athleteIndex) => {
        if (athleteIndex === undefined) {
            return "";
        }

        return athletes[athleteIndex].text || `Athlete ${athleteIndex + 1}`;
    };

    const voices = useVoices();
    const [voiceURI, setVoiceURI] = useState(initialConfig.voice);
    const voice = voices.find((v) => v.voiceURI === voiceURI);

    const [timeUntilNextChange, setTimeUntilNextChange] = useState(0);
    const [currentAthlete, setCurrentAthlete] = useState(undefined);

    useEffect(() => {
        saveConfig({ athletes, startDelay, speechEnabled, voice: voiceURI });
    }, [athletes, startDelay, speechEnabled, voiceURI]);

    const nextAthlete = useMemo(() => {
        const athletesWithIndex = athletes.map((a, ai) => ({ ...a, index: ai }));

        if (currentAthlete === undefined) {
            return athletesWithIndex.find((a) => a.enabled).index;
        }

        return [...athletesWithIndex.slice(currentAthlete + 1), ...athletesWithIndex].filter((a) => a.enabled)[0].index;
    }, [currentAthlete, athletes]);

    const startTimeRef = useRef();
    const prevTimeRef = useRef();
    const pauseTimeRef = useRef();

    const speak = (command) => {
        if (!speechEnabled) {
            return;
        }
        speakCommand(command, { nextAthlete: getAthleteName(nextAthlete) }, voice);
    };

    const changeToNextAthlete = () => {
        setCurrentAthlete(nextAthlete);
        setTimeUntilNextChange(athletes[nextAthlete].time);

        const now = Date.now();
        startTimeRef.current = now;
        if (state === "paused") {
            pauseTimeRef.current = now;
        }
    };

    useInterval(() => {
        if (state !== "running") {
            return;
        }

        const changeTime = currentAthlete === undefined ? startDelay : athletes[currentAthlete].time;

        const now = Date.now();

        const secondsSinceStart = toSeconds(now - startTimeRef.current);
        const prevSecondsSinceStart = toSeconds(prevTimeRef.current - startTimeRef.current);

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

        prevTimeRef.current = now;
        startTimeRef.current = now;

        setTimeUntilNextChange(startDelay > 0 ? startDelay : athletes[0].time);
        setCurrentAthlete(startDelay > 0 ? undefined : nextAthlete);

        setState("running");
    };

    const handleStop = () => {
        setState("stopped");
    };

    const handlePause = () => {
        setState("paused");
        pauseTimeRef.current = Date.now();
    };

    const handleResume = () => {
        setState("running");
        startTimeRef.current = Date.now() - (pauseTimeRef.current - startTimeRef.current);
    };

    return (
        <>
            <Header />

            <Container>
                <Jumbotron className="mb-2">
                    {state !== "stopped" ? (
                        <>
                            <h1 className="text-center display-2">
                                {currentAthlete === undefined ? "Wait" : getAthleteName(currentAthlete)}
                            </h1>

                            <h2 className="text-center display-5">
                                <FontAwesomeIcon icon={faArrowRight} /> {getAthleteName(nextAthlete)}
                            </h2>

                            <h3 className="text-center display-6">
                                <FontAwesomeIcon icon={faClock} /> {timeUntilNextChange}s
                            </h3>
                            <ProgressBar
                                style={{ transform: "scaleX(-1)", background: "white" }}
                                now={timeUntilNextChange}
                                max={currentAthlete === undefined ? startDelay : athletes[currentAthlete].time}
                            />

                            <div className="mt-4 text-center">
                                <Button variant="danger" className="mr-1" onClick={handleStop}>
                                    <FontAwesomeIcon icon={faStop} /> Stop
                                </Button>
                                {state === "paused" ? (
                                    <Button variant="info" className="mr-1" onClick={handleResume}>
                                        <FontAwesomeIcon icon={faPlay} /> Resume
                                    </Button>
                                ) : (
                                    <Button variant="info" className="mr-1" onClick={handlePause}>
                                        <FontAwesomeIcon icon={faPause} /> Pause
                                    </Button>
                                )}

                                <Button variant="warning" onClick={changeToNextAthlete}>
                                    <FontAwesomeIcon icon={faForward} /> Skip
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <Button variant="primary" onClick={handleStart} size="lg">
                                <FontAwesomeIcon icon={faPlay} /> Start
                            </Button>
                        </div>
                    )}
                </Jumbotron>

                <Card className="mb-2">
                    <Card.Body>
                        <AthletesSettings athletes={athletes} onChange={setAthletes} />

                        <h3>Settings</h3>
                        <Form.Group controlId="startDelay">
                            <Form.Label>
                                Start Delay (in seconds) <CopyButton command={`!t config startDelay ${startDelay}`} />
                            </Form.Label>
                            <Form.Control
                                type="number"
                                value={startDelay}
                                onChange={(e) => setStartDelay(+e.target.value)}
                                min={0}
                            />
                        </Form.Group>

                        <Form.Group controlId="athleteCount">
                            <Form.Label>Athlete Count</Form.Label>
                            <Form.Control
                                type="number"
                                value={athletes.length}
                                onChange={(e) => {
                                    const newCount = Math.max(1, Math.min(DEFAULT_ATHLETE_NAMES.length, +e.target.value));
                                    const newAthletes = [...new Array(newCount).keys()].map((i) => ({
                                        text: athletes[i]?.text ?? DEFAULT_ATHLETE_NAMES[i],
                                        time: athletes[i]?.time ?? DEFAULT_TIME_PER_ATHLETE,
                                        enabled: athletes[i]?.enabled ?? true,
                                    }));
                                    setAthletes(newAthletes);
                                }}
                                min={1}
                                max={DEFAULT_ATHLETE_NAMES.length}
                            />
                        </Form.Group>

                        <Form.Group controlId="speechEnabled">
                            <Form.Check
                                type="checkbox"
                                label="Voice Output"
                                checked={speechEnabled}
                                onChange={(e) => setSpeechEnabled(e.target.checked)}
                            />
                            <Form.Text>Voice Output is not supported on iOS</Form.Text>
                        </Form.Group>
                        <VoiceSettings voices={voices} voice={voice} onChange={(v) => setVoiceURI(v?.voiceURI)} />
                    </Card.Body>
                </Card>

                <DiscordBot />
                <Footer />
            </Container>
        </>
    );
}
