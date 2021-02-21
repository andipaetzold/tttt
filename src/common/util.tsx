export function secondsToString(fullTimeInSeconds: number) {

    const minutes = Math.floor(fullTimeInSeconds / 60);
    const seconds = Math.floor(fullTimeInSeconds - minutes * 60);

    if (minutes === 0) {
        return `${seconds}s`
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}min`;
}
