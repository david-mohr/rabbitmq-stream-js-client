"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsubscribeRequest = void 0;
const unsubscribe_response_1 = require("../responses/unsubscribe_response");
const abstract_request_1 = require("./abstract_request");
class UnsubscribeRequest extends abstract_request_1.AbstractRequest {
    subscriptionId;
    static Key = 0x000c;
    static Version = 1;
    key = UnsubscribeRequest.Key;
    responseKey = unsubscribe_response_1.UnsubscribeResponse.key;
    constructor(subscriptionId) {
        super();
        this.subscriptionId = subscriptionId;
    }
    writeContent(writer) {
        writer.writeUInt8(this.subscriptionId);
    }
}
exports.UnsubscribeRequest = UnsubscribeRequest;
//# sourceMappingURL=unsubscribe_request.js.map