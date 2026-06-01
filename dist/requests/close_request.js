"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseRequest = void 0;
const close_response_1 = require("../responses/close_response");
const abstract_request_1 = require("./abstract_request");
class CloseRequest extends abstract_request_1.AbstractRequest {
    params;
    responseKey = close_response_1.CloseResponse.key;
    static Key = 0x0016;
    static Version = 1;
    key = CloseRequest.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeUInt16(this.params.closingCode);
        writer.writeString(this.params.closingReason);
    }
}
exports.CloseRequest = CloseRequest;
//# sourceMappingURL=close_request.js.map