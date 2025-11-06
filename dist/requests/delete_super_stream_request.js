"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSuperStreamRequest = void 0;
const delete_super_stream_response_1 = require("../responses/delete_super_stream_response");
const abstract_request_1 = require("./abstract_request");
class DeleteSuperStreamRequest extends abstract_request_1.AbstractRequest {
    static Key = 0x001e;
    key = DeleteSuperStreamRequest.Key;
    static Version = 1;
    responseKey = delete_super_stream_response_1.DeleteSuperStreamResponse.key;
    streamName;
    constructor(streamName) {
        super();
        this.streamName = streamName;
    }
    writeContent(writer) {
        writer.writeString(this.streamName);
    }
}
exports.DeleteSuperStreamRequest = DeleteSuperStreamRequest;
//# sourceMappingURL=delete_super_stream_request.js.map