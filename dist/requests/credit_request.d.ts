import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export type CreditRequestParams = {
    subscriptionId: number;
    credit: number;
};
export declare class CreditRequest extends AbstractRequest {
    private params;
    static readonly Key = 9;
    readonly key = 9;
    static readonly Version = 1;
    readonly responseKey = -1;
    constructor(params: CreditRequestParams);
    protected writeContent(writer: DataWriter): void;
}
