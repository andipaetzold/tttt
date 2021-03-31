import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { captureException } from "@sentry/react";
import { useEffect, useRef, useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

type State = "DEFAULT" | "SUCCESS" | "ERROR";

interface Props {
    command: string;
}

export function CopyButton({ command }: Props) {
    const [tooltipState, setTooltipState] = useState<State>("DEFAULT");
    const copiedTimeout = useRef<number | undefined>(undefined);

    const [showButton, setShowButton] = useState(false);

    const copyCommand = () => {
        try {
            navigator.clipboard.writeText(command);

            if (copiedTimeout.current) {
                clearTimeout(copiedTimeout.current);
                copiedTimeout.current = undefined;
            }
            setTooltipState("SUCCESS");
            copiedTimeout.current = (setTimeout(() => setTooltipState("DEFAULT"), 5_000) as unknown) as number;
        } catch (e) {
            captureException(e);
            setTooltipState("ERROR");
        }
    };

    useEffect(() => {
        isSupported.then((r) => setShowButton(r));
    }, []);

    if (!showButton) {
        return null;
    }

    return (
        <OverlayTrigger
            placement="right"
            overlay={<Tooltip id="tooltip-copy-athletes">{getTooltipText(tooltipState)}</Tooltip>}
        >
            <Button variant="outline-link" size="sm" className="m-0 p-0 border-0" onClick={copyCommand}>
                <FontAwesomeIcon icon={faCopy} />
            </Button>
        </OverlayTrigger>
    );
}

function getTooltipText(state: State) {
    switch (state) {
        case "SUCCESS":
            return "Copied!";
        case "ERROR":
            return "Could not copy command.";
        default:
        case "DEFAULT":
            return "Copy Discord Bot command";
    }
}

async function isSupportedFn(): Promise<boolean> {
    if (!("permissions" in navigator)) {
        return false;
    }

    const result = await navigator.permissions.query({ name: "clipboard-write" });
    return result.state === "granted";
}
const isSupported = isSupportedFn();
