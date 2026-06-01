import { MetadataInfo, RawMetadataUpdateResponse } from "./raw_response";
import { Response } from "./response";
export declare class MetadataUpdateResponse implements Response {
    private response;
    static key: number;
    static readonly Version = 1;
    constructor(response: RawMetadataUpdateResponse);
    toBuffer(): Buffer;
    get key(): 16;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
    get metadataInfo(): MetadataInfo;
}
