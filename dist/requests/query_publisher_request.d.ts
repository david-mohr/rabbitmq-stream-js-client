import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class QueryPublisherRequest extends AbstractRequest {
    private params;
    static readonly Key = 5;
    static readonly Version = 1;
    readonly key = 5;
    readonly responseKey: number;
    constructor(params: {
        stream: string;
        publisherRef: string;
    });
    writeContent(writer: DataWriter): void;
}
