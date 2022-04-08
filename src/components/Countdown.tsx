import { faClock } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ProgressBar } from "react-bootstrap";
import { secondsToString } from "../common/util";

interface Props {
    timePassed: number;
    totalTime: number;
}

export function Countdown({ totalTime, timePassed }: Props) {
    return (
        <>
            <h3 className="text-center display-6">
                <FontAwesomeIcon icon={faClock} /> {secondsToString(totalTime - timePassed)}
            </h3>

            <ProgressBar
                style={{ transform: "scaleX(-1)", background: "white" }}
                now={Math.floor(totalTime - timePassed)}
                max={totalTime}
            />
        </>
    );
}
