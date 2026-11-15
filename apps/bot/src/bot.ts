// Entry point. Settings from the admin console (token, database, every variable) are loaded first, and only then is the
// bot itself imported: a static import would read the environment before they arrive. See libs/config/src/remote-config.ts.
import "@robo/config/remote";

await import("./main");
