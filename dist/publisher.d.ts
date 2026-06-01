import { CompressionType } from "./compression";
import { Connection, ConnectionInfo } from "./connection";
import { ConnectionPool } from "./connection_pool";
import { Logger } from "./logger";
import { MetadataUpdateListener } from "./response_decoder";
/**
 * Application-specific properties attached to a message (key-value pairs)
 */
export type MessageApplicationProperties = Record<string, string | number>;
/**
 * Message annotations for internal messaging properties
 */
export type MessageAnnotations = Record<string, MessageAnnotationsValue>;
/**
 * Allowed value types for message annotations
 */
export type MessageAnnotationsValue = string | number | AmqpByte;
/**
 * Represents a single byte value for AMQP encoding
 *
 * Used when you need to explicitly specify a byte-sized value in message annotations.
 */
export declare class AmqpByte {
    private value;
    constructor(value: number);
    get byteValue(): number;
}
/**
 * AMQP 1.0 message properties
 *
 * Standard message properties as defined in the AMQP 1.0 specification.
 */
export interface MessageProperties {
    contentType?: string;
    contentEncoding?: string;
    replyTo?: string;
    to?: string;
    subject?: string;
    correlationId?: string;
    messageId?: string;
    userId?: Buffer;
    absoluteExpiryTime?: Date;
    creationTime?: Date;
    groupId?: string;
    groupSequence?: number;
    replyToGroupId?: string;
}
/**
 * AMQP 1.0 message header
 *
 * Standard header fields as defined in the AMQP 1.0 specification.
 */
export interface MessageHeader {
    durable?: boolean;
    priority?: number;
    ttl?: number;
    firstAcquirer?: boolean;
    deliveryCount?: number;
}
/**
 * A message in a RabbitMQ stream
 *
 * Represents a complete message with content and optional AMQP 1.0 properties.
 */
export interface Message {
    content: Buffer;
    messageProperties?: MessageProperties;
    messageHeader?: MessageHeader;
    applicationProperties?: MessageApplicationProperties;
    messageAnnotations?: MessageAnnotations;
    amqpValue?: string;
    offset?: bigint;
}
/**
 * Options for sending a message
 *
 * Properties and metadata that can be attached when sending a message.
 */
export interface MessageOptions {
    messageProperties?: MessageProperties;
    applicationProperties?: Record<string, string | number>;
    messageAnnotations?: Record<string, MessageAnnotationsValue>;
    publishingId?: bigint;
}
/**
 * Compute an extended publisher ID that includes the connection ID
 *
 * @param publisherId - The numeric publisher ID
 * @param connectionId - The connection ID
 * @returns An extended publisher ID in the format "publisherId@connectionId"
 */
export declare const computeExtendedPublisherId: (publisherId: number, connectionId: string) => string;
/**
 * Interface for publishing messages to a RabbitMQ stream
 *
 * Publishers send messages to streams with features:
 * - Automatic batching and flushing
 * - Deduplication via publishing IDs
 * - Sub-batch entry publishing with optional compression
 * - Server-side filtering support
 */
export interface Publisher {
    /**
     * Sends a message in the stream
     *
     * @param {Buffer} message - The encoded content of the message
     * @param {MessageOptions} opts - The optional message options and properties
     * @returns {SendResult} Returns a boolean value and the associated publishingId
     */
    send(message: Buffer, opts?: MessageOptions): Promise<SendResult>;
    /**
     * Sends a message in the stream with a specific publishingId
     *
     * @param {bigint} publishingId - The associated publishingId
     * @param {Buffer} content - The encoded content of the message
     * @param {MessageOptions} opts - The optional message options and properties
     * @returns {SendResult} Returns a boolean value and the associated publishingId
     */
    basicSend(publishingId: bigint, content: Buffer, opts?: MessageOptions): Promise<SendResult>;
    /**
     * Sends all the accumulated messages on the internal buffer
     *
     * @returns {boolean} Returns false if there was an error
     */
    flush(): Promise<boolean>;
    /**
     * Sends a batch of messages
     *
     * @param {Message[]} messages - A batch of messages to send
     * @param {CompressionType} compressionType - Can optionally compress the messages
     */
    sendSubEntries(messages: Message[], compressionType?: CompressionType): Promise<void>;
    /**
     * Setup the listener for the metadata update event
     *
     * @param {"metadata_update"} event - The name of the event
     * @param {MetadataUpdateListener} listener - The listener which will be called when the event is fired
     */
    on(event: "metadata_update", listener: MetadataUpdateListener): void;
    /**
     * Setup the listener for the publish confirm event
     *
     * @param {"publish_confirm"} event - The name of the event
     * @param {PublishConfirmCallback} listener - The listener which will be called when the event is fired
     */
    on(event: "publish_confirm", listener: PublishConfirmCallback): void;
    /**
     * Gets the last publishing id in the stream
     *
     * @returns {bigint} Last publishing id
     */
    getLastPublishingId(): Promise<bigint>;
    /**
     * Gets the infos of the publisher's connection
     *
     * @returns {ConnectionInfo} Infos on the publisher's connection
     */
    getConnectionInfo(): ConnectionInfo;
    /**
     * Close the publisher
     */
    close(): Promise<void>;
    closed: boolean;
    ref: string;
    readonly publisherId: number;
    readonly extendedId: string;
}
/**
 * Function to extract a filter value from a message for server-side filtering
 *
 * Returns a string tag that will be used for bloom filter-based routing.
 */
export type FilterFunc = (msg: Message) => string | undefined;
/**
 * Callback for publish confirmations and errors
 */
type PublishConfirmCallback = (err: number | null, publishingIds: bigint[]) => void;
/**
 * Result of a send operation
 */
export type SendResult = {
    sent: boolean;
    publishingId: bigint;
    publisherId: number;
    connectionId: string;
};
/**
 * Implementation of a stream publisher
 *
 * StreamPublisher handles message publishing to a RabbitMQ stream with features:
 * - Automatic message batching based on maxChunkLength
 * - Deduplication via monotonically increasing publishing IDs
 * - Server-side filtering via filter functions
 * - Sub-batch entry publishing with optional compression (Gzip, etc.)
 * - Frame size validation to prevent oversized messages
 *
 * Messages are queued internally and sent in batches for optimal performance.
 * The publisher automatically schedules flushes when the queue reaches maxChunkLength.
 *
 * @example
 * ```typescript
 * // Basic publisher
 * const publisher = await client.declarePublisher({ stream: 'my-stream' });
 * await publisher.send(Buffer.from('Hello World'));
 * await publisher.close();
 *
 * // Publisher with deduplication
 * const dedupPublisher = await client.declarePublisher({
 *   stream: 'my-stream',
 *   publisherRef: 'my-publisher-ref'
 * });
 * await dedupPublisher.send(Buffer.from('Message 1'));
 * await dedupPublisher.send(Buffer.from('Message 2'));
 *
 * // Publisher with filtering
 * const filterPublisher = await client.declarePublisher(
 *   { stream: 'my-stream' },
 *   (msg) => msg.applicationProperties?.region
 * );
 * await filterPublisher.send(Buffer.from('Data'), {
 *   applicationProperties: { region: 'us-east-1' }
 * });
 * ```
 */
export declare class StreamPublisher implements Publisher {
    private pool;
    private readonly filter?;
    private connection;
    private stream;
    readonly publisherId: number;
    protected publisherRef: string;
    private publishingId;
    private maxFrameSize;
    private queue;
    private scheduled;
    private logger;
    private maxChunkLength;
    private _closed;
    constructor(pool: ConnectionPool, params: {
        connection: Connection;
        stream: string;
        publisherId: number;
        publisherRef?: string;
        maxFrameSize: number;
        maxChunkLength?: number;
        logger: Logger;
    }, publishingId: bigint, filter?: FilterFunc | undefined);
    get closed(): boolean;
    send(message: Buffer, opts?: MessageOptions): Promise<SendResult>;
    basicSend(publishingId: bigint, content: Buffer, opts?: MessageOptions): Promise<SendResult>;
    flush(): Promise<boolean>;
    sendSubEntries(messages: Message[], compressionType?: CompressionType): Promise<void>;
    getConnectionInfo(): ConnectionInfo;
    on(event: "metadata_update", listener: MetadataUpdateListener): void;
    on(event: "publish_confirm", listener: PublishConfirmCallback): void;
    getLastPublishingId(): Promise<bigint>;
    get ref(): string;
    close(): Promise<void>;
    automaticClose(): Promise<void>;
    get streamName(): string;
    private enqueue;
    private checkMessageSize;
    private sendBuffer;
    private scheduleIfNeeded;
    private add;
    private popChunk;
    get extendedId(): string;
}
export {};
