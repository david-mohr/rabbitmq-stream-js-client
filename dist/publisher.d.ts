import { CompressionType } from "./compression";
import { Connection, ConnectionInfo } from "./connection";
import { ConnectionPool } from "./connection_pool";
import { Logger } from "./logger";
import { MetadataUpdateListener } from "./response_decoder";
export type MessageApplicationProperties = Record<string, string | number>;
export type MessageAnnotations = Record<string, MessageAnnotationsValue>;
export type MessageAnnotationsValue = string | number | AmqpByte;
export declare class AmqpByte {
    private value;
    constructor(value: number);
    get byteValue(): number;
}
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
export interface MessageHeader {
    durable?: boolean;
    priority?: number;
    ttl?: number;
    firstAcquirer?: boolean;
    deliveryCount?: number;
}
export interface Message {
    content: Buffer;
    messageProperties?: MessageProperties;
    messageHeader?: MessageHeader;
    applicationProperties?: MessageApplicationProperties;
    messageAnnotations?: MessageAnnotations;
    amqpValue?: string;
    offset?: bigint;
}
export interface MessageOptions {
    messageProperties?: MessageProperties;
    applicationProperties?: Record<string, string | number>;
    messageAnnotations?: Record<string, MessageAnnotationsValue>;
    publishingId?: bigint;
}
export declare const computeExtendedPublisherId: (publisherId: number, connectionId: string) => string;
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
export type FilterFunc = (msg: Message) => string | undefined;
type PublishConfirmCallback = (err: number | null, publishingIds: bigint[]) => void;
export type SendResult = {
    sent: boolean;
    publishingId: bigint;
    publisherId: number;
    connectionId: string;
};
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
