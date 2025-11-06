import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class QueryOffsetRequest extends AbstractRequest {
    readonly responseKey: number;
    static readonly Key = 11;
    static readonly Version = 1;
    readonly key = 11;
    private readonly reference;
    private readonly stream;
    constructor(params: {
        reference: string;
        stream: string;
    });
    writeContent(writer: DataWriter): void;
}
