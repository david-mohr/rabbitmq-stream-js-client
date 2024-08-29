import { Compression, CompressionType } from "./compression";
import { Connection, ConnectionInfo } from "./connection";
import { Consumer, ConsumerFunc, StreamConsumer } from "./consumer";
import { Logger } from "./logger";
import { FilterFunc, Message, Publisher } from "./publisher";
import { CreateStreamArguments } from "./requests/create_stream_request";
import { BufferSizeSettings } from "./requests/request";
import { Offset } from "./requests/subscribe_request";
import { MetadataUpdateListener, PublishConfirmListener, PublishErrorListener } from "./response_decoder";
import { StreamMetadata } from "./responses/metadata_response";
import { SubscribeResponse } from "./responses/subscribe_response";
import { SuperStreamConsumer } from "./super_stream_consumer";
import { MessageKeyExtractorFunction, SuperStreamPublisher } from "./super_stream_publisher";
import { ConsumerCreditPolicy } from "./consumer_credit_policy";
export type ConnectionClosedListener = (hadError: boolean) => void;
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
export declare class Client {
    private readonly logger;
    private readonly params;
    readonly id: string;
    private consumers;
    private publishers;
    private compressions;
    private connection;
    private constructor();
    getCompression(compressionType: CompressionType): Compression;
    registerCompression(compression: Compression): void;
    start(): Promise<Client>;
    close(params?: ClosingParams): Promise<void>;
    private closeConnectionIfUnused;
    queryMetadata(params: QueryMetadataParams): Promise<StreamMetadata[]>;
    queryPartitions(params: QueryPartitionsParams): Promise<string[]>;
    declarePublisher(params: DeclarePublisherParams, filter?: FilterFunc): Promise<Publisher>;
    deletePublisher(extendedPublisherId: string): Promise<true>;
    declareConsumer(params: DeclareConsumerParams, handle: ConsumerFunc): Promise<Consumer>;
    closeConsumer(extendedConsumerId: string): Promise<true>;
    declareSuperStreamConsumer({ superStream, offset, consumerRef }: DeclareSuperStreamConsumerParams, handle: ConsumerFunc): Promise<SuperStreamConsumer>;
    declareSuperStreamPublisher({ superStream, publisherRef, routingStrategy }: DeclareSuperStreamPublisherParams, keyExtractor: MessageKeyExtractorFunction): Promise<SuperStreamPublisher>;
    queryOffset(params: QueryOffsetParams): Promise<bigint>;
    private closeAllConsumers;
    private closeAllPublishers;
    consumerCounts(): number;
    publisherCounts(): number;
    getConsumers(): ConsumerMappedValue[];
    createStream(params: {
        stream: string;
        arguments?: CreateStreamArguments;
    }): Promise<true>;
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
    private getLocatorConnection;
    private getConnection;
    private createSuperStreamPartitionsAndBindingKeys;
    private buildConnectionParams;
    private getConnectionOnChosenNode;
    static connect(params: ClientParams, logger?: Logger): Promise<Client>;
}
export type ClientListenersParams = {
    metadata_update?: MetadataUpdateListener;
    publish_confirm?: PublishConfirmListener;
    publish_error?: PublishErrorListener;
    connection_closed?: ConnectionClosedListener;
};
export interface SSLConnectionParams {
    key: string;
    cert: string;
    ca?: string;
}
export type AddressResolverParams = {
    enabled: true;
    endpoint?: {
        host: string;
        port: number;
    };
} | {
    enabled: false;
};
export interface ClientParams {
    hostname: string;
    port: number;
    username: string;
    password: string;
    mechanism?: string;
    vhost: string;
    frameMax?: number;
    heartbeat?: number;
    listeners?: ClientListenersParams;
    ssl?: SSLConnectionParams;
    bufferSizeSettings?: BufferSizeSettings;
    socketTimeout?: number;
    addressResolver?: AddressResolverParams;
    leader?: boolean;
    streamName?: string;
    connectionName?: string;
}
export interface DeclarePublisherParams {
    stream: string;
    publisherRef?: string;
    boot?: boolean;
    maxChunkLength?: number;
    connectionClosedListener?: ConnectionClosedListener;
}
export type RoutingStrategy = "key" | "hash";
export interface DeclareSuperStreamPublisherParams {
    superStream: string;
    publisherRef?: string;
    routingStrategy?: RoutingStrategy;
}
export type MessageFilter = (msg: Message) => boolean;
export interface ConsumerFilter {
    values: string[];
    postFilterFunc: MessageFilter;
    matchUnfiltered: boolean;
}
export interface DeclareConsumerParams {
    stream: string;
    consumerRef?: string;
    offset: Offset;
    connectionClosedListener?: ConnectionClosedListener;
    singleActive?: boolean;
    filter?: ConsumerFilter;
    creditPolicy?: ConsumerCreditPolicy;
}
export interface DeclareSuperStreamConsumerParams {
    superStream: string;
    consumerRef?: string;
    offset?: Offset;
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
export declare function connect(params: ClientParams, logger?: Logger): Promise<Client>;
export {};
