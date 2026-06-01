import { Message } from "../publisher";
import { RawDeliverResponse } from "./raw_response";
import { Response } from "./response";
export declare class DeliverResponse implements Response {
    private response;
    static key: number;
    static readonly Version = 1;
    constructor(response: RawDeliverResponse);
    toBuffer(): Buffer;
    get key(): 8;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
    get subscriptionId(): number;
    get messages(): Message[];
}
