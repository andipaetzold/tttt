import { faClock } from "@fortawesome/free-regular-svg-icons";
import {
    faArrowRight,
    faCompress,
    faExpand,
    faForward,
    faPause,
    faPlay,
    faStop,
    faVolumeMute,
    faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useInterval from "@use-it/interval";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Container, Form, Jumbotron, ProgressBar } from "react-bootstrap";
import { useFullScreenHandle } from "react-full-screen";
import { loadConfig, saveConfig } from "../common/config";
import { speakCommand } from "../common/speech";
import { secondsToString, toSeconds } from "../common/util";
import { useWakeLock } from "../hooks/useWakeLock";
import { State } from "../types";
import { AthletesSettings } from "./AthletesSettings";
import { CopyButton } from "./CopyButton";
import { DiscordBot } from "./DiscordBot";
import { Footer } from "./Footer";
import { Header } from "./Header";

const initialConfig = loadConfig();

export default function App() {
    const [state, setState] = useState<State>("stopped");

    const {
        node: fullscreenRef,
        active: fullscreenActive,
        enter: enterFullscreen,
        exit: leaveFullscreen,
    } = useFullScreenHandle();

    useWakeLock(state === "running" || state === "paused");

    const [startDelay, setStartDelay] = useState(initialConfig.startDelay);
    const [speechEnabled, setSpeechEnabled] = useState(initialConfig.speechEnabled);
    const [athletes, setAthletes] = useState(initialConfig.athletes);

    const getAthleteName = (athleteIndex: number) => {
        if (athleteIndex === undefined) {
            return "";
        }

        return athletes[athleteIndex].text || `Athlete ${athleteIndex + 1}`;
    };

    const [timeUntilNextChange, setTimeUntilNextChange] = useState(0);
    const [currentAthlete, setCurrentAthlete] = useState<number | undefined>(undefined);

    useEffect(() => {
        saveConfig({ athletes, startDelay, speechEnabled });
    }, [athletes, startDelay, speechEnabled]);

    const nextAthlete = useMemo(() => {
        const athletesWithIndex = athletes.map((a, ai) => ({ ...a, index: ai }));

        if (currentAthlete === undefined) {
            return athletesWithIndex.find((a) => a.enabled)!.index;
        }

        return [...athletesWithIndex.slice(currentAthlete + 1), ...athletesWithIndex].filter((a) => a.enabled)[0].index;
    }, [currentAthlete, athletes]);

    const startTimeRef = useRef<number | undefined>();
    const prevTimeRef = useRef<number | undefined>();
    const pauseTimeRef = useRef<number | undefined>();

    const speak = (command: string) => {
        if (!speechEnabled) {
            return;
        }
        speakCommand(command, {
            nextAthlete: getAthleteName(nextAthlete),
            started: currentAthlete !== undefined,
        });
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

        const secondsSinceStart = toSeconds(now - startTimeRef.current!);
        const prevSecondsSinceStart = toSeconds(prevTimeRef.current! - startTimeRef.current!);

        if (secondsSinceStart !== prevSecondsSinceStart) {
            speak(Math.max(0, changeTime - secondsSinceStart).toString());
            if (secondsSinceStart >= changeTime) {
                changeToNextAthlete();
            } else {
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
        setAthletes((athletes) => athletes.map((a) => ({ ...a, enabled: true })));

        setState("running");
    };

    const handleStop = () => {
        setState("stopped");
        setAthletes((athletes) => athletes.map((a) => ({ ...a, enabled: true })));
    };

    const handlePause = () => {
        setState("paused");
        pauseTimeRef.current = Date.now();
    };

    const handleResume = () => {
        setState("running");
        startTimeRef.current = Date.now() - (pauseTimeRef.current! - startTimeRef.current!);
    };

    return (
        <>
            <Header />

            <Container>
                <Jumbotron
                    className="pt-4 mb-2 position-relative d-flex flex-column align-items-center justify-content-center"
                    ref={fullscreenRef}
                >
                    {state !== "stopped" ? (
                        <div className="w-100">
                            <h1 className="text-center display-2">
                                {currentAthlete === undefined ? "Wait" : getAthleteName(currentAthlete)}
                            </h1>

                            <h2 className="text-center display-5">
                                <FontAwesomeIcon icon={faArrowRight} /> {getAthleteName(nextAthlete)}
                            </h2>

                            <h3 className="text-center display-6">
                                <FontAwesomeIcon icon={faClock} /> {secondsToString(timeUntilNextChange)}
                            </h3>
                            <ProgressBar
                                style={{ transform: "scaleX(-1)", background: "white" }}
                                now={timeUntilNextChange}
                                max={currentAthlete === undefined ? startDelay : athletes[currentAthlete].time}
                            />

                            <div className="mt-4 text-center">
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
                                    <FontAwesomeIcon icon={faForward} />{" "}
                                    {currentAthlete === undefined ? "Start now" : "Skip"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Button variant="primary" onClick={handleStart} size="lg">
                                <FontAwesomeIcon icon={faPlay} /> Start{" "}
                                {startDelay > 0 && `in ${secondsToString(startDelay)}`}
                            </Button>
                        </div>
                    )}

                    <div className="position-absolute" style={{ right: 16, bottom: 16 }}>
                        {state !== "stopped" && (
                            <Button variant="danger" size="sm" onClick={handleStop}>
                                <FontAwesomeIcon icon={faStop} /> Stop Timer
                            </Button>
                        )}

                        {speechEnabled ? (
                            <Button className="ml-2" size="sm" variant="secondary" onClick={() => setSpeechEnabled(false)}>
                                <FontAwesomeIcon icon={faVolumeUp} />
                            </Button>
                        ) : (
                            <Button className="ml-2" size="sm" variant="danger" onClick={() => setSpeechEnabled(true)}>
                                <FontAwesomeIcon icon={faVolumeMute} />
                            </Button>
                        )}

                        {fullscreenActive ? (
                            <Button className="ml-2" size="sm" variant="danger" onClick={leaveFullscreen}>
                                <FontAwesomeIcon icon={faCompress} />
                            </Button>
                        ) : (
                            <Button className="ml-2" size="sm" variant="secondary" onClick={enterFullscreen}>
                                <FontAwesomeIcon icon={faExpand} />
                            </Button>
                        )}
                    </div>

                    <div className="mt-5" style={{ maxWidth: "500px" }}>
                        <AthletesSettings athletes={athletes} onChange={setAthletes} state={state} />
                    </div>
                </Jumbotron>

                <Card className="mb-2">
                    <Card.Body>
                        <h3>Settings</h3>

                        <Form.Group controlId="startDelay">
                            <Form.Label>
                                Start Delay (in seconds) <CopyButton command={`!t config delay ${startDelay}`} />
                            </Form.Label>
                            <Form.Control
                                type="number"
                                value={startDelay}
                                onChange={(e) => setStartDelay(+e.target.value)}
                                min={0}
                                step={30}
                                disabled={state !== "stopped"}
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>

                <DiscordBot />
                <Footer />
            </Container>
        </>
    );
}
