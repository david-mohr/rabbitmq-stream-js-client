import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class HeartbeatRequest extends AbstractRequest {
    readonly responseKey: number;
    static readonly Key = 23;
    static readonly Version = 1;
    readonly key = 23;
    writeContent(_b: DataWriter): void;
}
