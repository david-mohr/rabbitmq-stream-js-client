import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class DeclarePublisherRequest extends AbstractRequest {
    private params;
    readonly responseKey: number;
    static readonly Key = 1;
    static readonly Version = 1;
    readonly key = 1;
    constructor(params: {
        stream: string;
        publisherId: number;
        publisherRef?: string;
    });
    writeContent(writer: DataWriter): void;
}
