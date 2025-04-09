import { Client } from "./client";
import { ConsumerFunc } from "./consumer";
import { ConsumerCreditPolicy } from "./consumer_credit_policy";
import { Offset } from "./requests/subscribe_request";
export declare class SuperStreamConsumer {
    readonly handle: ConsumerFunc;
    private consumers;
    consumerRef: string;
    readonly superStream: string;
    private locator;
    private partitions;
    private offset;
    private creditPolicy;
    private constructor();
    start(): Promise<void>;
    static create(handle: ConsumerFunc, params: {
        superStream: string;
        locator: Client;
        partitions: string[];
        consumerRef: string;
        offset: Offset;
        creditPolicy?: ConsumerCreditPolicy;
    }): Promise<SuperStreamConsumer>;
    close(): Promise<void>;
}
