import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export declare class PartitionsResponse extends AbstractResponse {
    static key: number;
    streams: string[];
    constructor(response: RawResponse);
}
