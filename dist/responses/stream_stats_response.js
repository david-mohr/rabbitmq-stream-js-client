"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamStatsResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class StreamStatsResponse extends abstract_response_1.AbstractResponse {
    static key = 0x801c;
    static Version = 1;
    rawStats = {};
    statistics = {
        committedChunkId: BigInt(0),
        firstChunkId: BigInt(0),
        lastChunkId: BigInt(0),
    };
    constructor(response) {
        super(response);
        this.verifyKey(StreamStatsResponse);
        const stats = this.response.payload.readInt32();
        for (let i = 0; i < stats; i++) {
            const statKey = this.response.payload.readString();
            const statVal = this.response.payload.readInt64();
            this.rawStats[statKey] = statVal;
        }
        this.statistics.committedChunkId = this.rawStats["committed_chunk_id"];
        this.statistics.firstChunkId = this.rawStats["first_chunk_id"];
        this.statistics.lastChunkId = this.rawStats["last_chunk_id"];
    }
}
exports.StreamStatsResponse = StreamStatsResponse;
//# sourceMappingURL=stream_stats_response.js.map