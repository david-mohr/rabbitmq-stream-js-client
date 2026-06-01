import { Message } from "../publisher";
import { RawDeliverResponseV2 } from "./raw_response";
import { Response } from "./response";
export declare class DeliverResponseV2 implements Response {
    private response;
    static key: number;
    static readonly Version = 2;
    constructor(response: RawDeliverResponseV2);
    toBuffer(): Buffer;
    get key(): 8;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
    get subscriptionId(): number;
    get committedChunkId(): bigint;
    get messages(): Message[];
}
