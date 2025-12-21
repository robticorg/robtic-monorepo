export declare function ensureDir(dir: string): void;
export declare function timestamp(local?: boolean): string;
export declare function dailyFile(name: string): string;
export declare function appendFileSafe(filePath: string, data: string): Promise<void>;
