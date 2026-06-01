"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteStreamRequest = void 0;
const abstract_request_1 = require("./abstract_request");
const delete_stream_response_1 = require("../responses/delete_stream_response");
class DeleteStreamRequest extends abstract_request_1.AbstractRequest {
    static Key = 0x000e;
    key = DeleteStreamRequest.Key;
    static Version = 1;
    responseKey = delete_stream_response_1.DeleteStreamResponse.key;
    stream;
    constructor(stream) {
        super();
        this.stream = stream;
    }
    writeContent(writer) {
        writer.writeString(this.stream);
    }
}
exports.DeleteStreamRequest = DeleteStreamRequest;
//# sourceMappingURL=delete_stream_request.js.map