"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclarePublisherRequest = void 0;
const declare_publisher_response_1 = require("../responses/declare_publisher_response");
const abstract_request_1 = require("./abstract_request");
class DeclarePublisherRequest extends abstract_request_1.AbstractRequest {
    params;
    responseKey = declare_publisher_response_1.DeclarePublisherResponse.key;
    static Key = 0x0001;
    static Version = 1;
    key = DeclarePublisherRequest.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeUInt8(this.params.publisherId);
        writer.writeString(this.params.publisherRef || "");
        writer.writeString(this.params.stream);
    }
}
exports.DeclarePublisherRequest = DeclarePublisherRequest;
//# sourceMappingURL=declare_publisher_request.js.map