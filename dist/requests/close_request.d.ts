import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class CloseRequest extends AbstractRequest {
    private params;
    readonly responseKey: number;
    static readonly Key = 22;
    static readonly Version = 1;
    readonly key = 22;
    constructor(params: {
        closingCode: number;
        closingReason: string;
    });
    writeContent(writer: DataWriter): void;
}
