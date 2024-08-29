import { ConsumerFilter } from "./client";
import { ConnectionInfo, Connection } from "./connection";
import { ConsumerCreditPolicy } from "./consumer_credit_policy";
import { Message } from "./publisher";
import { Offset } from "./requests/subscribe_request";
export type ConsumerFunc = (message: Message) => void;
export declare const computeExtendedConsumerId: (consumerId: number, connectionId: string) => string;
export interface Consumer {
    close(manuallyClose: boolean): Promise<void>;
    storeOffset(offsetValue: bigint): Promise<void>;
    queryOffset(): Promise<bigint>;
    getConnectionInfo(): ConnectionInfo;
    consumerId: number;
    consumerRef?: string;
    readonly extendedId: string;
}
export declare class StreamConsumer implements Consumer {
    readonly filter?: ConsumerFilter | undefined;
    private connection;
    private stream;
    consumerId: number;
    consumerRef?: string;
    offset: Offset;
    private clientLocalOffset;
    private creditsHandler;
    private consumerHandle;
    private closed;
    constructor(handle: ConsumerFunc, params: {
        connection: Connection;
        stream: string;
        consumerId: number;
        consumerRef?: string;
        offset: Offset;
        creditPolicy?: ConsumerCreditPolicy;
    }, filter?: ConsumerFilter | undefined);
    close(manuallyClose: boolean): Promise<void>;
    storeOffset(offsetValue: bigint): Promise<void>;
    queryOffset(): Promise<bigint>;
    getConnectionInfo(): ConnectionInfo;
    get localOffset(): Offset;
    handle(message: Message): void;
    get streamName(): string;
    get extendedId(): string;
    get creditPolicy(): ConsumerCreditPolicy;
    private maybeUpdateLocalOffset;
    private isMessageOffsetLessThanConsumers;
}
