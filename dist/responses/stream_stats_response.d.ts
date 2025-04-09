import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export interface Statistics {
    committedChunkId: bigint;
    firstChunkId: bigint;
    lastChunkId: bigint;
}
export declare class StreamStatsResponse extends AbstractResponse {
    static key: number;
    static readonly Version = 1;
    private rawStats;
    readonly statistics: Statistics;
    constructor(response: RawResponse);
}
