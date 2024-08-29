import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class DeleteStreamRequest extends AbstractRequest {
    static readonly Key = 14;
    readonly key = 14;
    static readonly Version = 1;
    readonly responseKey: number;
    private readonly stream;
    constructor(stream: string);
    protected writeContent(writer: DataWriter): void;
}
