"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatRequest = void 0;
const heartbeat_response_1 = require("../responses/heartbeat_response");
const abstract_request_1 = require("./abstract_request");
class HeartbeatRequest extends abstract_request_1.AbstractRequest {
    responseKey = heartbeat_response_1.HeartbeatResponse.key;
    static Key = 0x0017;
    static Version = 1;
    key = HeartbeatRequest.Key;
    writeContent(_b) {
        return;
    }
}
exports.HeartbeatRequest = HeartbeatRequest;
//# sourceMappingURL=heartbeat_request.js.map