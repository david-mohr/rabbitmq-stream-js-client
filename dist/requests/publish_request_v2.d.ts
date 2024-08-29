import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
import { PublishRequestMessage } from "./publish_request";
interface PublishRequestParams {
    publisherId: number;
    messages: Array<PublishRequestMessage>;
}
export declare class PublishRequestV2 extends AbstractRequest {
    private params;
    static readonly Key = 2;
    static readonly Version = 2;
    readonly key = 2;
    readonly responseKey = -1;
    constructor(params: PublishRequestParams);
    protected writeContent(writer: DataWriter): void;
    get version(): number;
}
export {};
