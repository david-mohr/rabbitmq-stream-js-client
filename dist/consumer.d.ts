import { ConsumerFilter } from "./client";
import { ConnectionInfo, Connection } from "./connection";
import { ConnectionPool } from "./connection_pool";
import { ConsumerCreditPolicy } from "./consumer_credit_policy";
import { Message } from "./publisher";
import { Offset } from "./requests/subscribe_request";
export type ConsumerFunc = (message: Message) => Promise<void> | void;
export type ConsumerUpdateListener = (consumerRef: string, streamName: string) => Promise<Offset>;
export declare const computeExtendedConsumerId: (consumerId: number, connectionId: string) => string;
export interface Consumer {
    /**
     * Close the publisher
     */
    close(): Promise<void>;
    /**
     * Store the stream offset on the server
     *
     * @param {bigint} offsetValue - The value of the offset to save, if not specified the local offset is used
     */
    storeOffset(offsetValue?: bigint): Promise<void>;
    /**
     * Get the saved offset on the server
     *
     * @returns {bigint} The value of the stream offset
     */
    queryOffset(): Promise<bigint>;
    /**
     * Get the stream local offset
     */
    getOffset(): bigint;
    /**
     * Gets the infos of the publisher's connection
     *
     * @returns {ConnectionInfo} Infos on the publisher's connection
     */
    getConnectionInfo(): ConnectionInfo;
    /**
     * Updates the offset of the consumer instance
     *
     * @param {Offset} offset - The new offset to set
     */
    updateConsumerOffset(offset: Offset): void;
    consumerId: number;
    consumerRef?: string;
    readonly extendedId: string;
}
export declare class StreamConsumer implements Consumer {
    private pool;
    readonly filter?: ConsumerFilter | undefined;
    private connection;
    private stream;
    consumerId: number;
    consumerRef?: string;
    consumerTag?: string;
    offset: Offset;
    consumerUpdateListener?: ConsumerUpdateListener;
    private clientLocalOffset;
    private creditsHandler;
    private consumerHandle;
    private closed;
    private singleActive;
    constructor(pool: ConnectionPool, handle: ConsumerFunc, params: {
        connection: Connection;
        stream: string;
        consumerId: number;
        consumerRef?: string;
        consumerTag?: string;
        offset: Offset;
        creditPolicy?: ConsumerCreditPolicy;
        singleActive?: boolean;
        consumerUpdateListener?: ConsumerUpdateListener;
    }, filter?: ConsumerFilter | undefined);
    close(): Promise<void>;
    automaticClose(): Promise<void>;
    storeOffset(offsetValue?: bigint): Promise<void>;
    queryOffset(): Promise<bigint>;
    getOffset(): bigint;
    getConnectionInfo(): ConnectionInfo;
    handle(message: Message): Promise<void>;
    get streamName(): string;
    get extendedId(): string;
    get creditPolicy(): ConsumerCreditPolicy;
    get isSingleActive(): boolean;
    updateConsumerOffset(offset: Offset): void;
    private maybeUpdateLocalOffset;
    private isMessageOffsetLessThanConsumers;
}
