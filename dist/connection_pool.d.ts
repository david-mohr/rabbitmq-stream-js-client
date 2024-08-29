import { Connection } from "./connection";
export type ConnectionPurpose = "consumer" | "publisher";
export declare class ConnectionPool {
    private static consumerConnectionProxies;
    private static publisherConnectionProxies;
    static getUsableCachedConnection(purpose: ConnectionPurpose, streamName: string, host: string): Connection | undefined;
    static cacheConnection(purpose: ConnectionPurpose, streamName: string, host: string, client: Connection): void;
    static removeIfUnused(connection: Connection): boolean;
    static removeCachedConnection(connection: Connection): void;
    private static getCacheKey;
}
