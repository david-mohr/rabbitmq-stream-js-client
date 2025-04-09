"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryOffsetResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class QueryOffsetResponse extends abstract_response_1.AbstractResponse {
    static key = 0x800b;
    static Version = 1;
    offsetValue;
    constructor(response) {
        super(response);
        this.verifyKey(QueryOffsetResponse);
        this.offsetValue = response.payload.readUInt64();
    }
}
exports.QueryOffsetResponse = QueryOffsetResponse;
//# sourceMappingURL=query_offset_response.js.map