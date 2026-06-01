import { ConsumerFilter } from "./client";
import { ConnectionInfo, Connection } from "./connection";
import { ConnectionPool } from "./connection_pool";
import { ConsumerCreditPolicy } from "./consumer_credit_policy";
import { Message } from "./publisher";
import { Offset } from "./requests/subscribe_request";
/**
 * Message handler function for processing consumed messages
 */
export type ConsumerFunc = (message: Message) => Promise<void> | void;
/**
 * Listener invoked when a single active consumer becomes active
 *
 * Returns the offset from which the consumer should start consuming.
 * Typically used to restore the last processed offset from a database.
 */
export type ConsumerUpdateListener = (consumerRef: string, streamName: string) => Promise<Offset>;
/**
 * Compute an extended consumer ID that includes the connection ID
 *
 * @param consumerId - The numeric consumer ID
 * @param connectionId - The connection ID
 * @returns An extended consumer ID in the format "consumerId@connectionId"
 */
export declare const computeExtendedConsumerId: (consumerId: number, connectionId: string) => string;
/**
 * Interface for consuming messages from a RabbitMQ stream
 *
 * Consumers receive messages from a stream starting at a specified offset.
 * They support features like offset tracking, single active consumer mode,
 * and credit-based flow control.
 */
export interface Consumer {
    /**
     * Close the consumer and release the connection
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
/**
 * Implementation of a stream consumer
 *
 * StreamConsumer handles message consumption from a RabbitMQ stream with features:
 * - Automatic offset tracking
 * - Credit-based flow control for back-pressure
 * - Single active consumer support for high availability
 * - Server-side and client-side offset storage
 * - Message filtering
 *
 * The consumer uses a credit policy to control how many message chunks are buffered.
 * The default policy processes chunks sequentially to maintain message order.
 *
 * @example
 * ```typescript
 * // Basic consumer
 * const consumer = await client.declareConsumer(
 *   { stream: 'my-stream', offset: Offset.first() },
 *   (message) => console.log(message.content.toString())
 * );
 *
 * // Consumer with offset tracking
 * const consumer = await client.declareConsumer(
 *   {
 *     stream: 'my-stream',
 *     offset: Offset.first(),
 *     consumerRef: 'my-consumer'
 *   },
 *   async (message) => {
 *     await processMessage(message);
 *     await consumer.storeOffset(); // Store current offset
 *   }
 * );
 * ```
 */
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
