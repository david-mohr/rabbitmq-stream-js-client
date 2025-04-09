"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaslAuthenticateResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class SaslAuthenticateResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8013;
    static Version = 1;
    constructor(response) {
        super(response);
        this.verifyKey(SaslAuthenticateResponse);
    }
    get data() {
        // TODO how to manage this data??
        return this.response.payload.toString();
    }
}
exports.SaslAuthenticateResponse = SaslAuthenticateResponse;
//# sourceMappingURL=sasl_authenticate_response.js.map