import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export interface CreateStreamArguments {
    "queue-leader-locator"?: "random" | "client-local" | "least-leaders";
    "max-age"?: string;
    "stream-max-segment-size-bytes"?: number;
    "initial-cluster-size"?: number;
    "max-length-bytes"?: number;
}
export declare class CreateStreamRequest extends AbstractRequest {
    readonly responseKey: number;
    static readonly Key = 13;
    static readonly Version = 1;
    readonly key = 13;
    private readonly _arguments;
    private readonly stream;
    constructor(params: {
        stream: string;
        arguments?: CreateStreamArguments;
    });
    writeContent(writer: DataWriter): void;
}
