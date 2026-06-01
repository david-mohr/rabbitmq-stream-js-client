"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaslHandshakeRequest = void 0;
const sasl_handshake_response_1 = require("../responses/sasl_handshake_response");
const abstract_request_1 = require("./abstract_request");
class SaslHandshakeRequest extends abstract_request_1.AbstractRequest {
    responseKey = sasl_handshake_response_1.SaslHandshakeResponse.key;
    static Key = 0x0012;
    static Version = 1;
    key = SaslHandshakeRequest.Key;
    writeContent(_dw) {
        // do nothing
    }
}
exports.SaslHandshakeRequest = SaslHandshakeRequest;
//# sourceMappingURL=sasl_handshake_request.js.map