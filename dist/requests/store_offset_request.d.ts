import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class StoreOffsetRequest extends AbstractRequest {
    readonly responseKey: number;
    static readonly Key = 10;
    static readonly Version = 1;
    readonly key = 10;
    private readonly reference;
    private readonly stream;
    private readonly offsetValue;
    constructor(params: {
        reference: string;
        stream: string;
        offsetValue: bigint;
    });
    writeContent(writer: DataWriter): void;
}
