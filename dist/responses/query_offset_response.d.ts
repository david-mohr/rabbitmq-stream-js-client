import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export declare class QueryOffsetResponse extends AbstractResponse {
    static key: number;
    static readonly Version = 1;
    readonly offsetValue: bigint;
    constructor(response: RawResponse);
}
