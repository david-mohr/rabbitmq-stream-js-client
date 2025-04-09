"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerUpdateResponse = void 0;
const consumer_update_query_1 = require("../responses/consumer_update_query");
const abstract_request_1 = require("./abstract_request");
class ConsumerUpdateResponse extends abstract_request_1.AbstractRequest {
    params;
    responseKey = consumer_update_query_1.ConsumerUpdateQuery.key;
    static Key = 0x801a;
    static Version = 1;
    key = ConsumerUpdateResponse.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(b) {
        b.writeUInt32(this.params.correlationId);
        b.writeUInt16(this.params.responseCode);
        this.params.offset.write(b);
    }
}
exports.ConsumerUpdateResponse = ConsumerUpdateResponse;
//# sourceMappingURL=consumer_update_response.js.map