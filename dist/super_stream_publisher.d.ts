import { Client, RoutingStrategy } from "./client";
import { CompressionType } from "./compression";
import { Message, MessageOptions, SendResult } from "./publisher";
export type MessageKeyExtractorFunction = (content: string, opts: MessageOptions) => string | undefined;
type SuperStreamPublisherParams = {
    locator: Client;
    superStream: string;
    publisherRef?: string;
    routingStrategy?: RoutingStrategy;
    keyExtractor: MessageKeyExtractorFunction;
};
export declare class SuperStreamPublisher {
    private locator;
    private partitions;
    private publishers;
    private superStream;
    private publisherRef;
    private keyExtractor;
    private routingStrategy;
    private routingCache;
    private constructor();
    static create(params: SuperStreamPublisherParams): Promise<SuperStreamPublisher>;
    start(): Promise<void>;
    close(): Promise<void>;
    send(message: Buffer, opts: MessageOptions): Promise<SendResult>;
    basicSend(publishingId: bigint, message: Buffer, opts: MessageOptions): Promise<SendResult>;
    sendSubEntries(messages: Message[], compressionType?: CompressionType): Promise<void>;
    getLastPublishingId(): Promise<bigint>;
    private routeMessage;
    private getPublisher;
    private initPublisher;
}
export {};
