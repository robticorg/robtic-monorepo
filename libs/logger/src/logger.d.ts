import { LoggerConfig, DatabaseLogType } from "@robo/shared";
export declare function initLogger(userCfg?: LoggerConfig): void;
export declare const Logger: {
    info: (msg: string) => Promise<void>;
    success: (msg: string) => Promise<void>;
    warn: (msg: string) => Promise<void>;
    error: (msg: string, err?: unknown, type?: "database" | "apps") => Promise<void>;
    database: (msg: string, Type?: DatabaseLogType) => Promise<void>;
    debug: (msg: string) => Promise<void>;
    health: (msg: string) => Promise<void>;
    perf: (label: string, ms: number) => Promise<void>;
};
