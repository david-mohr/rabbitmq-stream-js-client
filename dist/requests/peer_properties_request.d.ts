import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
export declare const PROPERTIES: {
    product: string;
    version: string;
    platform: string;
    copyright: string;
    information: string;
    connection_name: string;
};
export declare class PeerPropertiesRequest extends AbstractRequest {
    static readonly Key = 17;
    static readonly Version = 1;
    readonly key = 17;
    readonly responseKey: number;
    private readonly _properties;
    constructor(properties?: Record<string, string>);
    protected writeContent(writer: DataWriter): void;
}
