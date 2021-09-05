import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { captureException } from "@sentry/react";
import { useRef, useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

type State = "DEFAULT" | "SUCCESS" | "ERROR" | "NOT_SUPPORTED";

interface Props {
    command: string;
}

export function CopyButton({ command }: Props) {
    const [tooltipState, setTooltipState] = useState<State>("DEFAULT");
    const copiedTimeout = useRef<number | undefined>(undefined);

    const copyCommand = async () => {
        try {
            if (await isSupported()) {
                navigator.clipboard.writeText(command);

                if (copiedTimeout.current) {
                    clearTimeout(copiedTimeout.current);
                    copiedTimeout.current = undefined;
                }
                setTooltipState("SUCCESS");
            } else {
                setTooltipState("NOT_SUPPORTED");
            }
        } catch (e) {
            captureException(e);
            setTooltipState("ERROR");
        } finally {
            copiedTimeout.current = setTimeout(() => setTooltipState("DEFAULT"), 5_000) as unknown as number;
        }
    };

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
        case "NOT_SUPPORTED":
            return "Your browser doesn't allow copying the Dsiscord command.";
        default:
        case "DEFAULT":
            return "Copy Discord Bot command";
    }
}

async function isSupported(): Promise<boolean> {
    if (!("permissions" in navigator)) {
        return false;
    }

    const result = await navigator.permissions.query({ name: "clipboard-write" as PermissionName });
    return result.state === "granted";
}
