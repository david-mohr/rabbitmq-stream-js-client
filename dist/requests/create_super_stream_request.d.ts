import { AbstractRequest } from "./abstract_request";
import { CreateStreamArguments } from "./create_stream_request";
import { DataWriter } from "./data_writer";
export interface CreateSuperStreamParams {
    streamName: string;
    partitions: string[];
    bindingKeys: string[];
    arguments?: CreateStreamArguments;
}
export declare class CreateSuperStreamRequest extends AbstractRequest {
    readonly responseKey: number;
    static readonly Key = 29;
    static readonly Version = 1;
    readonly key = 29;
    private readonly _arguments;
    private readonly streamName;
    private readonly partitions;
    private readonly bindingKeys;
    constructor(params: CreateSuperStreamParams);
    writeContent(writer: DataWriter): void;
}
