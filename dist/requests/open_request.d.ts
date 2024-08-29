import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class OpenRequest extends AbstractRequest {
    private params;
    readonly responseKey: number;
    static readonly Key = 21;
    static readonly Version = 1;
    readonly key = 21;
    constructor(params: {
        virtualHost: string;
    });
    writeContent(writer: DataWriter): void;
}
