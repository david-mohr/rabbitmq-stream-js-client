import { RawResponse } from "./raw_response";
import { Response } from "./response";
export interface AbstractTypeClass {
    name: string;
    key: number;
    new (...args: any[]): AbstractResponse;
}
export declare abstract class AbstractResponse implements Response {
    protected response: RawResponse;
    constructor(response: RawResponse);
    protected verifyKey(type: AbstractTypeClass): void;
    get key(): number;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
}
