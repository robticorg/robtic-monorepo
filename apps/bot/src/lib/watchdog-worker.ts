// The freeze check (see watchdog.ts), on its own thread so it still runs when the bot's thread is stuck. The bot writes
// the time into `beat` every few seconds; when it stops for longer than `limitMs`, this kills the process and Docker
// starts it again (restart: unless-stopped).

declare const self: Worker;

self.onmessage = (e: MessageEvent<{ beat: Int32Array; limitMs: number; pid: number }>) => {
    const { beat, limitMs, pid } = e.data;
    setInterval(() => {
        const last = Atomics.load(beat, 0) * 1000;
        const stale = Date.now() - last;
        if (stale > limitMs) {
            console.error(`[watchdog] the bot has been frozen for ${Math.round(stale / 1000)}s, restarting`);
            process.kill(pid, "SIGKILL");
        }
    }, 10_000);
};
