"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamStatsRequest = void 0;
const stream_stats_response_1 = require("../responses/stream_stats_response");
const abstract_request_1 = require("./abstract_request");
class StreamStatsRequest extends abstract_request_1.AbstractRequest {
    streamName;
    responseKey = stream_stats_response_1.StreamStatsResponse.key;
    static Key = 0x001c;
    static Version = 1;
    key = StreamStatsRequest.Key;
    constructor(streamName) {
        super();
        this.streamName = streamName;
    }
    writeContent(writer) {
        writer.writeString(this.streamName);
    }
}
exports.StreamStatsRequest = StreamStatsRequest;
//# sourceMappingURL=stream_stats_request.js.map