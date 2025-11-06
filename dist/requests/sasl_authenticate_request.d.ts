import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class SaslAuthenticateRequest extends AbstractRequest {
    private params;
    readonly responseKey: number;
    static readonly Key = 19;
    static readonly Version = 1;
    readonly key = 19;
    constructor(params: {
        mechanism: string;
        username: string;
        password: string;
    });
    protected writeContent(writer: DataWriter): void;
}
