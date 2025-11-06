import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class PartitionsQuery extends AbstractRequest {
    private params;
    readonly responseKey: number;
    static readonly Key = 25;
    static readonly Version = 1;
    readonly key = 25;
    constructor(params: {
        superStream: string;
    });
    writeContent(writer: DataWriter): void;
}
