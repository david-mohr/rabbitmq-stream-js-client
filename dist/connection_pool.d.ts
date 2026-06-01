import { Connection } from "./connection";
import { Logger } from "./logger";
export type ConnectionPurpose = "consumer" | "publisher";
export declare class ConnectionPool {
    private readonly log;
    private connectionsMap;
    constructor(log: Logger);
    getConnection(entityType: ConnectionPurpose, streamName: string, vhost: string, host: string, connectionCreator: () => Promise<Connection>): Promise<Connection>;
    releaseConnection(connection: Connection, manuallyClose?: boolean): Promise<void>;
    private cacheConnection;
    private removeCachedConnection;
    private getCacheKey;
}
