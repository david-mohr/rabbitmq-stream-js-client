import { RawPublishConfirmResponse } from "./raw_response";
import { Response } from "./response";
export declare class PublishConfirmResponse implements Response {
    private response;
    static key: number;
    static readonly Version = 1;
    publishingIds: bigint[];
    private publisherId;
    constructor(response: RawPublishConfirmResponse);
    toBuffer(): Buffer;
    get key(): 3;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
}
