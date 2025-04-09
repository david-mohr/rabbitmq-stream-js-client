"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaslHandshakeResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class SaslHandshakeResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8012;
    static Version = 1;
    mechanisms = [];
    constructor(response) {
        super(response);
        this.verifyKey(SaslHandshakeResponse);
        const numOfMechanisms = this.response.payload.readInt32();
        for (let index = 0; index < numOfMechanisms; index++) {
            const mechanism = this.response.payload.readString();
            this.mechanisms.push(mechanism);
        }
    }
    get key() {
        return this.response.key;
    }
    get correlationId() {
        return this.response.correlationId;
    }
    get code() {
        return this.response.code;
    }
    get ok() {
        return this.code === 0x01;
    }
}
exports.SaslHandshakeResponse = SaslHandshakeResponse;
//# sourceMappingURL=sasl_handshake_response.js.map