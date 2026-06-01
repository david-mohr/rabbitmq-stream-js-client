"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionsQuery = void 0;
const partitions_response_1 = require("../responses/partitions_response");
const abstract_request_1 = require("./abstract_request");
class PartitionsQuery extends abstract_request_1.AbstractRequest {
    params;
    responseKey = partitions_response_1.PartitionsResponse.key;
    static Key = 0x0019;
    static Version = 1;
    key = PartitionsQuery.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeString(this.params.superStream);
    }
}
exports.PartitionsQuery = PartitionsQuery;
//# sourceMappingURL=partitions_query.js.map