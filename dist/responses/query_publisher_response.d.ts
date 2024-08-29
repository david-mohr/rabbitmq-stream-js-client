import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export declare class QueryPublisherResponse extends AbstractResponse {
    static key: number;
    static readonly Version = 1;
    readonly sequence: bigint;
    constructor(response: RawResponse);
}
