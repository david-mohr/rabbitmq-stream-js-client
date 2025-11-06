"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryPublisherResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class QueryPublisherResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8005;
    static Version = 1;
    sequence = 0n;
    constructor(response) {
        super(response);
        this.verifyKey(QueryPublisherResponse);
        this.sequence = this.response.payload.readUInt64();
    }
}
exports.QueryPublisherResponse = QueryPublisherResponse;
//# sourceMappingURL=query_publisher_response.js.map