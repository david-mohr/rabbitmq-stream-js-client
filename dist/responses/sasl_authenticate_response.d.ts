import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export declare class SaslAuthenticateResponse extends AbstractResponse {
    static key: number;
    static readonly Version = 1;
    constructor(response: RawResponse);
    get data(): string;
}
