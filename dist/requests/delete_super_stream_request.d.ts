import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class DeleteSuperStreamRequest extends AbstractRequest {
    static readonly Key = 30;
    readonly key = 30;
    static readonly Version = 1;
    readonly responseKey: number;
    private readonly streamName;
    constructor(streamName: string);
    protected writeContent(writer: DataWriter): void;
}
