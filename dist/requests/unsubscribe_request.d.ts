import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class UnsubscribeRequest extends AbstractRequest {
    private subscriptionId;
    static readonly Key = 12;
    static readonly Version = 1;
    readonly key = 12;
    readonly responseKey: number;
    constructor(subscriptionId: number);
    protected writeContent(writer: DataWriter): void;
}
