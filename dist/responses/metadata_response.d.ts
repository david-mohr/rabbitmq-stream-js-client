import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export interface Broker {
    reference: number;
    host: string;
    port: number;
}
export interface StreamMetadata {
    streamName: string;
    responseCode: number;
    leader?: Broker;
    replicas?: Broker[];
}
export declare class MetadataResponse extends AbstractResponse {
    static key: 32783;
    static readonly Version = 1;
    readonly streamInfos: StreamMetadata[];
    constructor(response: RawResponse);
    private readReplicasReferencesFrom;
    get ok(): boolean;
}
