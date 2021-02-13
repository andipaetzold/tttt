export function toSeconds(ms) {
    return Math.round(ms / 1_000);
}

export function secondsToString(fullTimeInSeconds) {
    const minutes = Math.floor(fullTimeInSeconds / 60);
    const seconds = fullTimeInSeconds - minutes * 60;

    if (minutes === 0) {
        return `${seconds}s`
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}min`;
}
