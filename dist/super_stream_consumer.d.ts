import { Client } from "./client";
import { ConsumerFunc } from "./consumer";
import { Offset } from "./requests/subscribe_request";
export declare class SuperStreamConsumer {
    readonly handle: ConsumerFunc;
    private consumers;
    consumerRef: string;
    private locator;
    private partitions;
    private offset;
    private constructor();
    start(): Promise<void>;
    static create(handle: ConsumerFunc, params: {
        locator: Client;
        partitions: string[];
        consumerRef: string;
        offset: Offset;
    }): Promise<SuperStreamConsumer>;
    close(): Promise<void>;
}
