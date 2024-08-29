import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare class RouteQuery extends AbstractRequest {
    private params;
    readonly responseKey: number;
    static readonly Key = 24;
    static readonly Version = 1;
    readonly key = 24;
    constructor(params: {
        routingKey: string;
        superStream: string;
    });
    writeContent(writer: DataWriter): void;
}
