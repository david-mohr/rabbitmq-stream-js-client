import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export declare class DeclarePublisherResponse extends AbstractResponse {
    static key: number;
    static readonly Version = 1;
    readonly properties: Record<string, string>;
    constructor(response: RawResponse);
}
