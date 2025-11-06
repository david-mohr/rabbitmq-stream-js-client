import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class MetadataRequest extends AbstractRequest {
    private params;
    readonly responseKey: 32783;
    static readonly Key = 15;
    static readonly Version = 1;
    readonly key = 15;
    constructor(params: {
        streams: string[];
    });
    writeContent(writer: DataWriter): void;
}
