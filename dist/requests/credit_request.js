"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditRequest = void 0;
const abstract_request_1 = require("./abstract_request");
class CreditRequest extends abstract_request_1.AbstractRequest {
    params;
    static Key = 0x09;
    key = CreditRequest.Key;
    static Version = 1;
    responseKey = -1;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeUInt8(this.params.subscriptionId);
        writer.writeUInt16(this.params.credit);
    }
}
exports.CreditRequest = CreditRequest;
//# sourceMappingURL=credit_request.js.map