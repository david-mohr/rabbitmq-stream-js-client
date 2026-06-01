import { Client } from "./client";
import { Consumer } from "./consumer";
import { ConsumerCreditPolicy } from "./consumer_credit_policy";
import { Message } from "./publisher";
import { Offset } from "./requests/subscribe_request";
export type SuperStreamConsumerFunc = (msg: Message, consumer: Consumer) => Promise<void> | void;
export declare class SuperStreamConsumer {
    readonly handle: SuperStreamConsumerFunc;
    private consumers;
    consumerRef: string;
    readonly superStream: string;
    private locator;
    private partitions;
    private offset;
    private creditPolicy;
    private constructor();
    start(): Promise<void>;
    static create(handle: SuperStreamConsumerFunc, params: {
        superStream: string;
        locator: Client;
        partitions: string[];
        consumerRef: string;
        offset: Offset;
        creditPolicy?: ConsumerCreditPolicy;
    }): Promise<SuperStreamConsumer>;
    close(): Promise<void>;
}
