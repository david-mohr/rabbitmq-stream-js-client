"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePublisherRequest = void 0;
const delete_publisher_response_1 = require("../responses/delete_publisher_response");
const abstract_request_1 = require("./abstract_request");
class DeletePublisherRequest extends abstract_request_1.AbstractRequest {
    publisherId;
    responseKey = delete_publisher_response_1.DeletePublisherResponse.key;
    static Key = 0x0006;
    static Version = 1;
    key = DeletePublisherRequest.Key;
    constructor(publisherId) {
        super();
        this.publisherId = publisherId;
    }
    writeContent(writer) {
        writer.writeUInt8(this.publisherId);
    }
}
exports.DeletePublisherRequest = DeletePublisherRequest;
//# sourceMappingURL=delete_publisher_request.js.map