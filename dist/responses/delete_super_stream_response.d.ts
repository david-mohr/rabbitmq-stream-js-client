import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export declare class DeleteSuperStreamResponse extends AbstractResponse {
    static key: number;
    static readonly Version = 1;
    constructor(response: RawResponse);
}
