import { Compression, CompressionType } from "./compression";
import { Logger } from "./logger";
import { Request } from "./requests/request";
import { ConsumerUpdateQueryListener, DeliverListener, DeliverV2Listener, MetadataUpdateListener, PublishConfirmListener, PublishErrorListener } from "./response_decoder";
import { Response } from "./responses/response";
import { Version } from "./versions";
import { ClientListenersParams, ClientParams, ClosingParams, QueryOffsetParams, StoreOffsetParams } from "./client";
/**
 * Callback invoked when a connection closes
 */
export type ConnectionClosedListener = (hadError: boolean) => void;
/**
 * Extended listener parameters for connections, including delivery and consumer update listeners
 */
export type ConnectionListenersParams = ClientListenersParams & {
    deliverV1?: DeliverListener;
    deliverV2?: DeliverV2Listener;
    consumer_update_query?: ConsumerUpdateQueryListener;
};
/**
 * Parameters for creating a connection
 */
export type ConnectionParams = ClientParams & {
    listeners?: ConnectionListenersParams;
    connectionId: string;
};
/**
 * Information about the current state of a connection
 */
export type ConnectionInfo = {
    /** The host the connection is connected to */
    host: string;
    /** The port the connection is connected to */
    port: number;
    /** Unique identifier for this connection */
    id: string;
    /** Whether the connection handshake has completed */
    ready: boolean;
    /** The virtual host */
    vhost: string;
    /** Whether the socket is readable */
    readable?: boolean;
    /** Whether the socket is writable */
    writable?: boolean;
    /** Local port number of the connection */
    localPort?: number;
};
/**
 * Represents a TCP/TLS connection to a RabbitMQ node
 *
 * The Connection class handles:
 * - Low-level socket management (TCP/TLS)
 * - Stream protocol handshake (peer properties, SASL auth, tuning, open)
 * - Request/response correlation and routing
 * - Heartbeat management
 * - Message encoding/decoding via ResponseDecoder
 * - Publisher and consumer ID generation
 *
 * Connections can be pooled and shared among multiple publishers/consumers
 * based on stream name, vhost, host, and purpose (publisher/consumer).
 */
export declare class Connection {
    private readonly params;
    private readonly logger;
    readonly hostname: string;
    readonly vhost: string;
    readonly leader: boolean;
    readonly streamName: string | undefined;
    private socket;
    private correlationId;
    private decoder;
    private receivedResponses;
    private waitingResponses;
    private heartbeat;
    private compressions;
    private peerProperties;
    private readonly bufferSizeSettings;
    private frameMax;
    readonly connectionId: string;
    private connectionClosedListener;
    private serverEndpoint;
    private readonly serverDeclaredVersions;
    private refs;
    private filteringEnabled;
    userManuallyClose: boolean;
    private setupCompleted;
    publisherId: number;
    consumerId: number;
    private consumerListeners;
    private publisherListeners;
    private closeEventsEmitter;
    constructor(params: ConnectionParams, logger: Logger);
    private createSocket;
    private registerSocketListeners;
    private unregisterSocketListeners;
    /**
     * Restart the connection after a failure
     *
     * This recreates the socket and re-establishes the connection including
     * the full handshake process (peer properties, auth, tuning, open).
     *
     * @returns A promise that resolves when the connection is restarted
     */
    restart(): Promise<void>;
    /**
     * Create and connect a new Connection instance
     *
     * @param params - Connection parameters
     * @param logger - Logger instance
     * @returns A promise that resolves to a connected Connection
     */
    static connect(params: ConnectionParams, logger: Logger): Promise<Connection>;
    /**
     * Create a new Connection instance without connecting
     *
     * @param params - Connection parameters
     * @param logger - Logger instance
     * @returns A new Connection instance
     */
    static create(params: ConnectionParams, logger: Logger): Connection;
    /**
     * Start the connection by registering listeners and initiating the socket connection
     *
     * @returns A promise that resolves to the connection once handshake completes
     */
    start(): Promise<Connection>;
    on(event: "metadata_update", listener: MetadataUpdateListener): void;
    on(event: "publish_confirm", listener: PublishConfirmListener): void;
    on(event: "publish_error", listener: PublishErrorListener): void;
    on(event: "deliverV1", listener: DeliverListener): void;
    on(event: "deliverV2", listener: DeliverV2Listener): void;
    on(event: "consumer_update_query", listener: ConsumerUpdateQueryListener): void;
    private logSocket;
    registerForClosePublisher(publisherExtendedId: string, streamName: string, callback: () => void | Promise<void>): void;
    registerForCloseConsumer(consumerExtendedId: string, streamName: string, callback: () => void | Promise<void>): void;
    private registerListeners;
    getCompression(compressionType: CompressionType): Compression;
    registerCompression(compression: Compression): void;
    private exchangeCommandVersions;
    /**
     * Send a request and wait for its response
     *
     * This method sends a request with a correlation ID and waits for the matching response.
     * The correlation ID is used to match requests with their responses.
     *
     * @param cmd - The request to send
     * @returns A promise that resolves to the response
     * @throws {Error} If the socket write fails or the response indicates an error
     */
    sendAndWait<T extends Response>(cmd: Request): Promise<T>;
    private waitResponse;
    /**
     * Get information about the current connection state
     *
     * @returns Connection information including host, port, ready state, and socket state
     */
    getConnectionInfo(): ConnectionInfo;
    private responseReceived;
    private received;
    private exchangeProperties;
    /**
     * Send a request without waiting for a response
     *
     * Used for fire-and-forget commands like credit requests or heartbeats.
     *
     * @param cmd - The request to send
     * @returns A promise that resolves when the request is sent
     */
    send(cmd: Request): Promise<void>;
    private incCorrelationId;
    private getBufferSizeParams;
    get maxFrameSize(): number;
    get serverVersions(): Version[];
    get rabbitManagementVersion(): string;
    get isFilteringEnabled(): boolean;
    get ready(): boolean;
    private auth;
    private open;
    private virtualHostIsValid;
    private tune;
    private calculateFrameMaxSizeFrom;
    /**
     * Close the connection
     *
     * Stops heartbeat, sends close request, and ends the socket.
     *
     * @param params - Optional closing parameters with code and reason
     * @returns A promise that resolves when the connection is closed
     */
    close(params?: ClosingParams): Promise<void>;
    /**
     * Query the last publishing ID for a publisher reference
     *
     * Used for deduplication to get the last published sequence number for a publisher.
     *
     * @param params - Stream name and publisher reference
     * @returns A promise that resolves to the last publishing sequence number
     * @throws {Error} If the query fails
     */
    queryPublisherSequence(params: {
        stream: string;
        publisherRef: string;
    }): Promise<bigint>;
    /**
     * Store an offset on the server for a consumer reference
     *
     * @param params - Reference name, stream name, and offset value to store
     * @returns A promise that resolves when the offset is stored
     */
    storeOffset(params: StoreOffsetParams): Promise<void>;
    /**
     * Query a stored offset from the server for a consumer reference
     *
     * @param params - Reference name and stream name
     * @returns A promise that resolves to the stored offset value
     * @throws {Error} If the query fails
     */
    queryOffset(params: QueryOffsetParams): Promise<bigint>;
    incrRefCount(): void;
    decrRefCount(): number;
    get refCount(): number;
    getNextPublisherId(): number;
    getNextConsumerId(): number;
}
export declare function errorMessageOf(code: number): string;
export declare function connect(logger: Logger, params: ConnectionParams): Promise<Connection>;
export declare function create(logger: Logger, params: ConnectionParams): Connection;
export declare function partition<T>(arr: T[], predicate: (t: T) => boolean): [T[], T[]];
