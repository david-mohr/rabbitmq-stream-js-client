import { Compression } from "../compression";
import { Message } from "../publisher";
import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
interface SubEntryBatchPublishRequestParams {
    publisherId: number;
    publishingId: bigint;
    compression: Compression;
    maxFrameSize: number;
    messages: Message[];
}
export declare class SubEntryBatchPublishRequest extends AbstractRequest {
    private params;
    static readonly Key = 2;
    static readonly Version = 1;
    readonly key = 2;
    readonly responseKey = -1;
    private readonly maxFrameSize;
    constructor(params: SubEntryBatchPublishRequestParams);
    protected writeContent(writer: DataWriter): void;
    private encodeCompressionType;
}
export {};
