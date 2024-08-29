import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class TuneRequest extends AbstractRequest {
    private params;
    readonly responseKey: number;
    static readonly Key = 20;
    static readonly Version = 1;
    readonly key = 20;
    constructor(params: {
        frameMax: number;
        heartbeat: number;
    });
    writeContent(b: DataWriter): void;
}
