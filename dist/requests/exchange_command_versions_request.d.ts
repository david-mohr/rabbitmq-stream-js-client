import { Version } from "../versions";
import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class ExchangeCommandVersionsRequest extends AbstractRequest {
    readonly versions: Version[];
    static readonly Key = 27;
    readonly key = 27;
    static readonly Version = 1;
    readonly responseKey: number;
    constructor(versions: Version[]);
    writeContent(writer: DataWriter): void;
}
