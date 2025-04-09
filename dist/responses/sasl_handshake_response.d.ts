import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export declare class SaslHandshakeResponse extends AbstractResponse {
    static key: number;
    static readonly Version = 1;
    readonly mechanisms: string[];
    constructor(response: RawResponse);
    get key(): number;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
}
