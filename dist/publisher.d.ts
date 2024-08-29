import { CompressionType } from "./compression";
import { Connection, ConnectionInfo } from "./connection";
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
}
export declare const computeExtendedPublisherId: (publisherId: number, connectionId: string) => string;
export interface Publisher {
    send(message: Buffer, opts?: MessageOptions): Promise<SendResult>;
    basicSend(publishingId: bigint, content: Buffer, opts?: MessageOptions): Promise<SendResult>;
    flush(): Promise<boolean>;
    sendSubEntries(messages: Message[], compressionType?: CompressionType): Promise<void>;
    on(event: "metadata_update", listener: MetadataUpdateListener): void;
    on(event: "publish_confirm", listener: PublishConfirmCallback): void;
    getLastPublishingId(): Promise<bigint>;
    getConnectionInfo(): ConnectionInfo;
    close(manuallyClose: boolean): Promise<void>;
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
};
export declare class StreamPublisher implements Publisher {
    private readonly filter?;
    private connection;
    private stream;
    readonly publisherId: number;
    protected publisherRef: string;
    private boot;
    private publishingId;
    private maxFrameSize;
    private queue;
    private scheduled;
    private logger;
    private maxChunkLength;
    private _closed;
    constructor(params: {
        connection: Connection;
        stream: string;
        publisherId: number;
        publisherRef?: string;
        boot?: boolean;
        maxFrameSize: number;
        maxChunkLength?: number;
        logger: Logger;
    }, filter?: FilterFunc | undefined);
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
    close(manuallyClose: boolean): Promise<void>;
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
