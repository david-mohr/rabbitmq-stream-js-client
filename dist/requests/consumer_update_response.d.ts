import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
import { Offset } from "./subscribe_request";
export declare class ConsumerUpdateResponse extends AbstractRequest {
    private params;
    readonly responseKey: number;
    static readonly Key = 32794;
    static readonly Version = 1;
    readonly key = 32794;
    constructor(params: {
        correlationId: number;
        responseCode: number;
        offset: Offset;
    });
    writeContent(b: DataWriter): void;
}
