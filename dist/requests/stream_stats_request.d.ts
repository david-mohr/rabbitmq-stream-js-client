import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class StreamStatsRequest extends AbstractRequest {
    private streamName;
    readonly responseKey: number;
    static readonly Key = 28;
    static readonly Version = 1;
    readonly key = 28;
    constructor(streamName: string);
    writeContent(writer: DataWriter): void;
}
