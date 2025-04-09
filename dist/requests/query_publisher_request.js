"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryPublisherRequest = void 0;
const abstract_request_1 = require("./abstract_request");
const query_publisher_response_1 = require("../responses/query_publisher_response");
class QueryPublisherRequest extends abstract_request_1.AbstractRequest {
    params;
    static Key = 0x0005;
    static Version = 1;
    key = QueryPublisherRequest.Key;
    responseKey = query_publisher_response_1.QueryPublisherResponse.key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeString(this.params.publisherRef);
        writer.writeString(this.params.stream);
    }
}
exports.QueryPublisherRequest = QueryPublisherRequest;
//# sourceMappingURL=query_publisher_request.js.map