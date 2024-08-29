import { Message } from "../publisher";
import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export type PublishRequestMessage = {
    publishingId: bigint;
    filterValue?: string;
    message: Message;
};
interface PublishRequestParams {
    publisherId: number;
    messages: Array<PublishRequestMessage>;
}
export declare class PublishRequest extends AbstractRequest {
    private params;
    static readonly Key = 2;
    static readonly Version = 1;
    readonly key = 2;
    readonly responseKey = -1;
    constructor(params: PublishRequestParams);
    protected writeContent(writer: DataWriter): void;
}
export {};
