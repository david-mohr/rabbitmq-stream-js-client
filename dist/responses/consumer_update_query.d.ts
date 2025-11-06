import { RawConsumerUpdateQueryResponse as RawConsumerUpdateQuery } from "./raw_response";
import { Response } from "./response";
export declare class ConsumerUpdateQuery implements Response {
    private response;
    static key: number;
    static readonly Version = 1;
    constructor(response: RawConsumerUpdateQuery);
    toBuffer(): Buffer;
    get key(): 26;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
    get subscriptionId(): number;
    get active(): number;
}
