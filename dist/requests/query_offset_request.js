"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryOffsetRequest = void 0;
const query_offset_response_1 = require("../responses/query_offset_response");
const abstract_request_1 = require("./abstract_request");
class QueryOffsetRequest extends abstract_request_1.AbstractRequest {
    responseKey = query_offset_response_1.QueryOffsetResponse.key;
    static Key = 0x000b;
    static Version = 1;
    key = QueryOffsetRequest.Key;
    reference;
    stream;
    constructor(params) {
        super();
        this.stream = params.stream;
        this.reference = params.reference;
    }
    writeContent(writer) {
        writer.writeString(this.reference);
        writer.writeString(this.stream);
    }
}
exports.QueryOffsetRequest = QueryOffsetRequest;
//# sourceMappingURL=query_offset_request.js.map