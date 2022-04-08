import {
    faArrowRight,
    faCompress,
    faExpand,
    faForward,
    faPause,
    faPlay,
    faPlus,
    faStop,
    faVolumeMute,
    faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useInterval from "@use-it/interval";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Container, Form, Jumbotron } from "react-bootstrap";
import { useFullScreenHandle } from "react-full-screen";
import { loadConfig, saveConfig } from "../common/config";
import { isSpeechSupported, speakCommand } from "../common/speech";
import { secondsToString } from "../common/util";
import { useWakeLock } from "../hooks/useWakeLock";
import { Round, State } from "../types";
import { AthletesSettings } from "./AthletesSettings";
import { CopyButton } from "./CopyButton";
import { Countdown } from "./Countdown";
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

    const [round, setRound] = useState<Round | undefined>(undefined);

    const getAthleteName = (athleteIndex: number) => {
        if (athleteIndex === undefined) {
            return "";
        }

        return athletes[athleteIndex].text || `Athlete ${athleteIndex + 1}`;
    };

    useEffect(() => {
        saveConfig({ athletes, startDelay, speechEnabled });
    }, [athletes, startDelay, speechEnabled]);

    const nextAthlete = useMemo(() => {
        const athletesWithIndex = athletes.map((a, ai) => ({ ...a, index: ai }));

        if (round?.currentAthlete === undefined) {
            return athletesWithIndex.find((a) => a.enabled)!.index;
        }

        return [...athletesWithIndex.slice(round.currentAthlete + 1), ...athletesWithIndex].filter((a) => a.enabled)[0]
            .index;
    }, [round, athletes]);

    const speak = (command: string) => {
        if (!speechEnabled) {
            return;
        }

        speakCommand(command, {
            nextAthlete: getAthleteName(nextAthlete),
            started: round?.currentAthlete !== undefined,
        });
    };

    const prevTimeRef = useRef<number | undefined>();
    useInterval(() => {
        const now = Date.now();
        const timeDiff = (now - prevTimeRef.current!) / 1_000;
        prevTimeRef.current = now;

        if (state !== "running" || round === undefined) {
            return;
        }

        let updatedRound: Round = {
            ...round,
            timePassed: round.timePassed + timeDiff,
        };

        if (Math.floor(round.timePassed) !== Math.floor(updatedRound.timePassed)) {
            const remainingTime = updatedRound.totalTime - updatedRound.timePassed;
            const remainingTimeInSeconds = Math.floor(Math.max(0, remainingTime));

            speak(remainingTimeInSeconds.toString());

            if (remainingTimeInSeconds === 0) {
                updatedRound = {
                    timePassed: -remainingTime,
                    currentAthlete: nextAthlete,
                    totalTime: athletes[nextAthlete].time,
                };
            }
        }

        setRound(updatedRound);
    }, 500);

    const handleSkip = () => {
        speak("skip");
        setRound({
            timePassed: 0,
            currentAthlete: nextAthlete,
            totalTime: athletes[nextAthlete].time,
        });
    };

    const handleStart = () => {
        const now = Date.now();
        prevTimeRef.current = now;

        setRound({
            timePassed: 0,
            totalTime: startDelay > 0 ? startDelay : athletes[0].time,
            currentAthlete: startDelay > 0 ? undefined : nextAthlete,
        });

        setAthletes((athletes) => athletes.map((a) => ({ ...a, enabled: true })));

        setState("running");
    };

    const handleStop = () => {
        setState("stopped");
        setAthletes((athletes) => athletes.map((a) => ({ ...a, enabled: true })));
    };

    const handlePause = () => {
        setState("paused");
    };

    const handleResume = () => {
        setState("running");
    };

    const handlePlus10 = () => {
        if (!round) {
            return;
        }

        setRound({
            ...round,
            totalTime: round.totalTime + 10,
        });
    };

    return (
        <>
            <Header />

            <Container>
                <Jumbotron
                    className="pt-4 mb-2 position-relative d-flex flex-column align-items-center justify-content-center"
                    ref={fullscreenRef}
                >
                    {state !== "stopped" && round !== undefined ? (
                        <div className="w-100">
                            <h1 className="text-center display-2">
                                {round.currentAthlete === undefined ? "Wait" : getAthleteName(round.currentAthlete)}
                            </h1>

                            <h2 className="text-center display-5">
                                <FontAwesomeIcon icon={faArrowRight} /> {getAthleteName(nextAthlete)}
                            </h2>

                            <Countdown timePassed={round.timePassed} totalTime={round.totalTime} />

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

                                <Button variant="warning" className="mr-1" onClick={handleSkip}>
                                    <FontAwesomeIcon icon={faForward} />{" "}
                                    {round.currentAthlete === undefined ? "Start now" : "Skip"}
                                </Button>

                                {state === "running" && (
                                    <Button variant="success" onClick={handlePlus10}>
                                        <FontAwesomeIcon icon={faPlus} /> 10s
                                    </Button>
                                )}
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

                        {isSpeechSupported && (
                            <>
                                {speechEnabled ? (
                                    <Button
                                        className="ml-2"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setSpeechEnabled(false)}
                                    >
                                        <FontAwesomeIcon icon={faVolumeUp} />
                                    </Button>
                                ) : (
                                    <Button
                                        className="ml-2"
                                        size="sm"
                                        variant="danger"
                                        onClick={() => setSpeechEnabled(true)}
                                    >
                                        <FontAwesomeIcon icon={faVolumeMute} />
                                    </Button>
                                )}
                            </>
                        )}

                        {document.fullscreenEnabled && (
                            <>
                                {fullscreenActive ? (
                                    <Button className="ml-2" size="sm" variant="danger" onClick={leaveFullscreen}>
                                        <FontAwesomeIcon icon={faCompress} />
                                    </Button>
                                ) : (
                                    <Button className="ml-2" size="sm" variant="secondary" onClick={enterFullscreen}>
                                        <FontAwesomeIcon icon={faExpand} />
                                    </Button>
                                )}
                            </>
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
