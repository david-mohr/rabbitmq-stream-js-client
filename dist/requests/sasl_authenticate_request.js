"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaslAuthenticateRequest = void 0;
const sasl_authenticate_response_1 = require("../responses/sasl_authenticate_response");
const abstract_request_1 = require("./abstract_request");
function assertUnreachable(mechanism) {
    throw new Error(`Auth mechanism '${mechanism}' not implemented`);
}
class SaslAuthenticateRequest extends abstract_request_1.AbstractRequest {
    params;
    responseKey = sasl_authenticate_response_1.SaslAuthenticateResponse.key;
    static Key = 0x0013;
    static Version = 1;
    key = SaslAuthenticateRequest.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeString(this.params.mechanism);
        switch (this.params.mechanism) {
            case "PLAIN":
                writer.writeUInt32(this.params.password.length + this.params.username.length + 2);
                writer.writeUInt8(0);
                writer.writeData(this.params.username);
                writer.writeUInt8(0);
                writer.writeData(this.params.password);
                break;
            case "EXTERNAL":
                writer.writeUInt32(0);
                break;
            default:
                assertUnreachable(this.params.mechanism);
        }
    }
}
exports.SaslAuthenticateRequest = SaslAuthenticateRequest;
//# sourceMappingURL=sasl_authenticate_request.js.map