import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class DeletePublisherRequest extends AbstractRequest {
    private publisherId;
    readonly responseKey: number;
    static readonly Key = 6;
    static readonly Version = 1;
    readonly key = 6;
    constructor(publisherId: number);
    writeContent(writer: DataWriter): void;
}
