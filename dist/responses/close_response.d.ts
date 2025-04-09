import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export declare class CloseResponse extends AbstractResponse {
    static key: number;
    static readonly Version = 1;
    constructor(response: RawResponse);
}
