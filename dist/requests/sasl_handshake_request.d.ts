import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class SaslHandshakeRequest extends AbstractRequest {
    readonly responseKey: number;
    static readonly Key = 18;
    static readonly Version = 1;
    readonly key = 18;
    protected writeContent(_dw: DataWriter): void;
}
