export declare function removeFrom<T>(l: T[], predicate: (x: T) => boolean): T | undefined;
export declare function range(count: number): number[];
export declare const DEFAULT_FRAME_MAX = 1048576;
export declare const DEFAULT_UNLIMITED_FRAME_MAX = 0;
export declare const REQUIRED_MANAGEMENT_VERSION = "3.13.0";
export declare const getMaxSharedConnectionInstances: () => number;
export declare const getAddressResolverFromEnv: () => {
    host: string;
    port: number;
};
export declare const sample: <T>(items: (T | undefined)[]) => T | undefined;
export declare const bigIntMax: (n: bigint[]) => bigint | undefined;
