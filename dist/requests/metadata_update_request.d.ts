import { MetadataInfo } from "../responses/raw_response";
import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class MetadataUpdateRequest extends AbstractRequest {
    private params;
    readonly responseKey = -1;
    static readonly Key = 16;
    static readonly Version = 1;
    readonly key = 16;
    constructor(params: {
        metadataInfo: MetadataInfo;
    });
    writeContent(b: DataWriter): void;
}
