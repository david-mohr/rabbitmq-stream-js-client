import { RawPublishErrorResponse } from "./raw_response";
import { Response } from "./response";
interface PublishingError {
    publishingId: bigint;
    code: number;
}
export declare class PublishErrorResponse implements Response {
    private response;
    static key: number;
    static readonly Version = 1;
    private publisherId;
    publishingError: PublishingError;
    constructor(response: RawPublishErrorResponse);
    toBuffer(): Buffer;
    get key(): 4;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
}
export {};
