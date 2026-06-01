import { Compression, CompressionType } from "./compression";
import { Connection, ConnectionInfo } from "./connection";
import { Consumer, ConsumerFunc, ConsumerUpdateListener, StreamConsumer } from "./consumer";
import { Logger } from "./logger";
import { FilterFunc, Message, Publisher } from "./publisher";
import { CreateStreamArguments } from "./requests/create_stream_request";
import { BufferSizeSettings } from "./requests/request";
import { Offset } from "./requests/subscribe_request";
import { MetadataUpdateListener } from "./response_decoder";
import { StreamMetadata } from "./responses/metadata_response";
import { SubscribeResponse } from "./responses/subscribe_response";
import { SuperStreamConsumer, SuperStreamConsumerFunc } from "./super_stream_consumer";
import { MessageKeyExtractorFunction, SuperStreamPublisher } from "./super_stream_publisher";
import { ConsumerCreditPolicy } from "./consumer_credit_policy";
import { PublishConfirmResponse } from "./responses/publish_confirm_response";
import { PublishErrorResponse } from "./responses/publish_error_response";
/**
 * Callback invoked when a connection is closed
 * @param hadError - True if the connection closed due to an error
 */
export type ConnectionClosedListener = (hadError: boolean) => void;
/**
 * Callback invoked when a publish is confirmed by the server
 * @param confirm - The publish confirmation response
 * @param connectionId - The ID of the connection that sent the confirmation
 */
export type ConnectionPublishConfirmListener = (confirm: PublishConfirmResponse, connectionId: string) => void;
/**
 * Callback invoked when a publish error occurs
 * @param confirm - The publish error response
 * @param connectionId - The ID of the connection that reported the error
 */
export type ConnectionPublishErrorListener = (confirm: PublishErrorResponse, connectionId: string) => void;
/**
 * Parameters for closing connections
 */
export type ClosingParams = {
    closingCode: number;
    closingReason: string;
    manuallyClose?: boolean;
};
type ConsumerMappedValue = {
    connection: Connection;
    consumer: StreamConsumer;
    params: DeclareConsumerParams;
};
/**
 * Main RabbitMQ Stream client for managing connections, publishers, and consumers.
 *
 * The Client class serves as the primary entry point for interacting with RabbitMQ streams.
 * It manages:
 * - A locator connection for metadata queries and topology management
 * - A connection pool for sharing TCP connections among publishers and consumers
 * - Publisher and consumer lifecycle
 * - Stream creation and deletion
 *
 * @example
 * ```typescript
 * const client = await connect({
 *   hostname: 'localhost',
 *   port: 5552,
 *   username: 'guest',
 *   password: 'guest',
 *   vhost: '/'
 * });
 *
 * await client.createStream({ stream: 'my-stream' });
 * const publisher = await client.declarePublisher({ stream: 'my-stream' });
 * await publisher.send(Buffer.from('Hello World'));
 * await client.close();
 * ```
 */
export declare class Client {
    private readonly logger;
    private readonly params;
    readonly id: string;
    private consumers;
    private publishers;
    private compressions;
    private locatorConnection;
    private pool;
    private constructor();
    getCompression(compressionType: CompressionType): Compression;
    registerCompression(compression: Compression): void;
    /**
     * Start the client by establishing the locator connection
     * @returns A promise that resolves to the client instance
     */
    start(): Promise<Client>;
    /**
     * Close the client and all associated publishers, consumers, and connections
     * @param params - Optional closing parameters with code and reason
     * @returns A promise that resolves when the client is fully closed
     * @example
     * ```typescript
     * await client.close();
     * // or with custom parameters
     * await client.close({ closingCode: 1, closingReason: 'Shutting down' });
     * ```
     */
    close(params?: ClosingParams): Promise<void>;
    /**
     * Query metadata for one or more streams
     * @param params - Parameters containing the list of stream names to query
     * @returns A promise that resolves to an array of stream metadata
     * @throws {Error} If the query returns an error code
     */
    queryMetadata(params: QueryMetadataParams): Promise<StreamMetadata[]>;
    /**
     * Query the partitions of a super stream
     * @param params - Parameters containing the super stream name
     * @returns A promise that resolves to an array of partition stream names
     * @throws {Error} If the query returns an error code
     */
    queryPartitions(params: QueryPartitionsParams): Promise<string[]>;
    /**
     * Declare a publisher for a stream
     *
     * Publishers are used to send messages to a stream. If a publisherRef is provided,
     * deduplication is enabled and the publisher will use monotonically increasing publishing IDs.
     *
     * @param params - Publisher configuration including stream name and optional publisherRef
     * @param filter - Optional filter function for server-side message filtering
     * @returns A promise that resolves to a Publisher instance
     * @throws {Error} If the declare command fails or filtering is not supported by the broker
     * @example
     * ```typescript
     * // Simple publisher
     * const publisher = await client.declarePublisher({ stream: 'my-stream' });
     * await publisher.send(Buffer.from('Hello'));
     *
     * // Publisher with deduplication
     * const dedupPublisher = await client.declarePublisher({
     *   stream: 'my-stream',
     *   publisherRef: 'unique-publisher-ref'
     * });
     * ```
     */
    declarePublisher(params: DeclarePublisherParams, filter?: FilterFunc): Promise<Publisher>;
    deletePublisher(extendedPublisherId: string): Promise<true>;
    /**
     * Declare a consumer for a stream
     *
     * Consumers receive messages from a stream starting at a specified offset.
     * They can be configured with various options including single active consumer mode,
     * filtering, and custom credit policies.
     *
     * @param params - Consumer configuration including stream, offset, and optional settings
     * @param handle - Message handler function that processes received messages
     * @param superStreamConsumer - Optional super stream consumer for internal use
     * @returns A promise that resolves to a Consumer instance
     * @throws {Error} If the consumer cannot be declared or filtering is not supported
     * @example
     * ```typescript
     * // Basic consumer
     * const consumer = await client.declareConsumer(
     *   { stream: 'my-stream', offset: Offset.first() },
     *   (message) => console.log(message.content.toString())
     * );
     *
     * // Single active consumer with offset tracking
     * const sacConsumer = await client.declareConsumer(
     *   {
     *     stream: 'my-stream',
     *     offset: Offset.first(),
     *     singleActive: true,
     *     consumerRef: 'my-consumer-group',
     *     consumerUpdateListener: async (ref, stream) => {
     *       const offset = await client.queryOffset({ reference: ref, stream });
     *       return Offset.offset(offset);
     *     }
     *   },
     *   (message) => console.log(message.content.toString())
     * );
     * ```
     */
    declareConsumer(params: DeclareConsumerParams, handle: ConsumerFunc, superStreamConsumer?: SuperStreamConsumer): Promise<Consumer>;
    closeConsumer(extendedConsumerId: string): Promise<boolean>;
    declareSuperStreamConsumer({ superStream, offset, consumerRef, creditPolicy }: DeclareSuperStreamConsumerParams, handle: SuperStreamConsumerFunc): Promise<SuperStreamConsumer>;
    declareSuperStreamPublisher({ superStream, publisherRef, routingStrategy }: DeclareSuperStreamPublisherParams, keyExtractor: MessageKeyExtractorFunction): Promise<SuperStreamPublisher>;
    queryOffset(params: QueryOffsetParams): Promise<bigint>;
    private closeAllConsumers;
    private closeAllPublishers;
    consumerCounts(): number;
    publisherCounts(): number;
    getConsumers(): ConsumerMappedValue[];
    /**
     * Create a new stream on the RabbitMQ server
     *
     * @param params - Stream configuration including name and optional arguments (max-length-bytes, max-age, etc.)
     * @returns A promise that resolves to true when the stream is created or already exists
     * @throws {Error} If the create command fails with an error other than "already exists"
     * @example
     * ```typescript
     * // Simple stream
     * await client.createStream({ stream: 'my-stream' });
     *
     * // Stream with retention policy
     * await client.createStream({
     *   stream: 'my-stream',
     *   arguments: {
     *     'max-length-bytes': 10_000_000_000, // 10GB
     *     'max-age': '7D' // 7 days
     *   }
     * });
     * ```
     */
    createStream(params: {
        stream: string;
        arguments?: CreateStreamArguments;
    }): Promise<true>;
    /**
     * Delete a stream from the RabbitMQ server
     *
     * @param params - Parameters containing the stream name to delete
     * @returns A promise that resolves to true when the stream is deleted
     * @throws {Error} If the delete command fails
     */
    deleteStream(params: {
        stream: string;
    }): Promise<true>;
    createSuperStream(params: {
        streamName: string;
        arguments?: CreateStreamArguments;
    }, bindingKeys?: string[], numberOfPartitions?: number): Promise<true>;
    deleteSuperStream(params: {
        streamName: string;
    }): Promise<true>;
    streamStatsRequest(streamName: string): Promise<import("./responses/stream_stats_response").Statistics>;
    getConnectionInfo(): ConnectionInfo;
    subscribe(params: SubscribeParams): Promise<SubscribeResponse>;
    /**
     * Restart the client after a connection failure
     *
     * This method re-establishes all connections (locator, publishers, and consumers)
     * and re-declares all publishers and consumers. Useful for automatic reconnection
     * after network failures.
     *
     * @returns A promise that resolves when all connections are restarted
     * @example
     * ```typescript
     * const client = await connect({
     *   // ...connection params
     *   listeners: {
     *     connection_closed: (hadError) => {
     *       client.restart()
     *         .then(() => console.log('Reconnected'))
     *         .catch(err => console.error('Reconnection failed', err));
     *     }
     *   }
     * });
     * ```
     */
    restart(): Promise<void>;
    get maxFrameSize(): number;
    get serverVersions(): import("./versions").Version[];
    get rabbitManagementVersion(): string;
    routeQuery(params: {
        routingKey: string;
        superStream: string;
    }): Promise<string[]>;
    partitionsQuery(params: {
        superStream: string;
    }): Promise<string[]>;
    private declarePublisherOnConnection;
    private declareConsumerOnConnection;
    private askForCredit;
    private getDeliverV1Callback;
    private getDeliverV2Callback;
    private handleDelivery;
    private getConsumerUpdateCallback;
    private getConsumerOrServerSavedOffset;
    private getLocatorConnection;
    private getConnection;
    private createSuperStreamPartitionsAndBindingKeys;
    private buildConnectionParams;
    private getConnectionOnChosenNode;
    private unsubscribe;
    private closing;
    /**
     * Create and connect a new Client instance
     *
     * @param params - Connection parameters including hostname, port, credentials, and optional settings
     * @param logger - Optional logger instance for debugging
     * @returns A promise that resolves to a connected Client instance
     * @example
     * ```typescript
     * const client = await Client.connect({
     *   hostname: 'localhost',
     *   port: 5552,
     *   username: 'guest',
     *   password: 'guest',
     *   vhost: '/'
     * });
     * ```
     */
    static connect(params: ClientParams, logger?: Logger): Promise<Client>;
}
/**
 * Listener callbacks for client events
 */
export type ClientListenersParams = {
    metadata_update?: MetadataUpdateListener;
    publish_confirm?: ConnectionPublishConfirmListener;
    publish_error?: ConnectionPublishErrorListener;
    connection_closed?: ConnectionClosedListener;
};
/**
 * TLS/SSL connection parameters for secure connections
 */
export interface SSLConnectionParams {
    key?: string;
    cert?: string;
    ca?: string;
    rejectUnauthorized?: boolean;
}
/**
 * Configuration for load balancer/address resolver mode
 */
export type AddressResolverParams = {
    enabled: true;
    endpoint?: {
        host: string;
        port: number;
    };
} | {
    enabled: false;
};
/**
 * Configuration parameters for connecting to RabbitMQ
 */
export interface ClientParams {
    hostname: string;
    port: number;
    username: string;
    password: string;
    mechanism?: "PLAIN" | "EXTERNAL";
    vhost: string;
    frameMax?: number;
    heartbeat?: number;
    listeners?: ClientListenersParams;
    ssl?: SSLConnectionParams | boolean;
    bufferSizeSettings?: BufferSizeSettings;
    socketTimeout?: number;
    addressResolver?: AddressResolverParams;
    leader?: boolean;
    streamName?: string;
    connectionName?: string;
}
/**
 * Parameters for declaring a publisher
 */
export interface DeclarePublisherParams {
    /** Name of the stream to publish to */
    stream: string;
    /** Optional reference for deduplication - if provided, enables publishing ID tracking */
    publisherRef?: string;
    /** Optional maximum chunk length for batching */
    maxChunkLength?: number;
    /** Optional callback when the publisher's connection closes */
    connectionClosedListener?: ConnectionClosedListener;
}
/**
 * Routing strategy for super stream publishers
 */
export type RoutingStrategy = "key" | "hash";
/**
 * Parameters for declaring a super stream publisher
 */
export interface DeclareSuperStreamPublisherParams {
    superStream: string;
    publisherRef?: string;
    routingStrategy?: RoutingStrategy;
}
/**
 * Function to filter messages on the client side
 */
export type MessageFilter = (msg: Message) => boolean;
/**
 * Configuration for message filtering (both server-side and client-side)
 */
export interface ConsumerFilter {
    /** Filter values for server-side bloom filter */
    values: string[];
    /** Optional client-side post-filter function */
    postFilterFunc: MessageFilter;
    /** Whether to match messages without filter tags */
    matchUnfiltered: boolean;
}
/**
 * Parameters for declaring a consumer
 */
export interface DeclareConsumerParams {
    stream: string;
    consumerRef?: string;
    offset: Offset;
    connectionClosedListener?: ConnectionClosedListener;
    consumerUpdateListener?: ConsumerUpdateListener;
    singleActive?: boolean;
    filter?: ConsumerFilter;
    creditPolicy?: ConsumerCreditPolicy;
    consumerTag?: string;
}
export interface DeclareSuperStreamConsumerParams {
    superStream: string;
    consumerRef?: string;
    offset?: Offset;
    creditPolicy?: ConsumerCreditPolicy;
}
export interface SubscribeParams {
    subscriptionId: number;
    stream: string;
    credit: number;
    offset: Offset;
}
export interface StoreOffsetParams {
    reference: string;
    stream: string;
    offsetValue: bigint;
}
export interface QueryOffsetParams {
    reference: string;
    stream: string;
}
export interface QueryMetadataParams {
    streams: string[];
}
export interface QueryPartitionsParams {
    superStream: string;
}
/**
 * Connect to RabbitMQ and create a new Client instance
 *
 * This is the main entry point for creating a connection to RabbitMQ streams.
 * It establishes a locator connection for metadata queries and sets up connection pooling.
 *
 * @param params - Connection parameters including hostname, port, credentials, and optional settings
 * @param logger - Optional logger instance for debugging and monitoring
 * @returns A promise that resolves to a connected Client instance
 * @throws {Error} If connection fails (invalid credentials, network issues, etc.)
 * @example
 * ```typescript
 * // Basic connection
 * const client = await connect({
 *   hostname: 'localhost',
 *   port: 5552,
 *   username: 'guest',
 *   password: 'guest',
 *   vhost: '/'
 * });
 *
 * // Connection with TLS
 * const secureClient = await connect({
 *   hostname: 'rabbitmq.example.com',
 *   port: 5551,
 *   username: 'user',
 *   password: 'pass',
 *   vhost: '/',
 *   ssl: {
 *     cert: fs.readFileSync('client-cert.pem'),
 *     key: fs.readFileSync('client-key.pem'),
 *     ca: fs.readFileSync('ca-cert.pem')
 *   }
 * });
 *
 * // Connection with listeners
 * const client = await connect({
 *   hostname: 'localhost',
 *   port: 5552,
 *   username: 'guest',
 *   password: 'guest',
 *   vhost: '/',
 *   listeners: {
 *     connection_closed: (hadError) => {
 *       console.log('Connection closed', hadError);
 *     },
 *     publish_confirm: (confirm, connId) => {
 *       console.log('Message confirmed', confirm.publishingId);
 *     }
 *   }
 * });
 * ```
 */
export declare function connect(params: ClientParams, logger?: Logger): Promise<Client>;
export {};
