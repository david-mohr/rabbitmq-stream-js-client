import { RawCreditResponse } from "./raw_response";
import { Response } from "./response";
export declare class CreditResponse implements Response {
    private response;
    static key: 32777;
    static readonly Version = 1;
    constructor(response: RawCreditResponse);
    toBuffer(): Buffer;
    get key(): 32777;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
    get responseCode(): number;
    get subscriptionId(): number;
}
