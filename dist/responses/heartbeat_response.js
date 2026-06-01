"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatResponse = void 0;
class HeartbeatResponse {
    response;
    static key = 0x0017;
    static Version = 1;
    constructor(response) {
        this.response = response;
        if (this.response.key !== HeartbeatResponse.key) {
            throw new Error(`Unable to create ${HeartbeatResponse.name} from data of type ${this.response.key}`);
        }
    }
    get key() {
        return this.response.key;
    }
    get correlationId() {
        return -1;
    }
    get code() {
        return -1;
    }
    get ok() {
        return true;
    }
}
exports.HeartbeatResponse = HeartbeatResponse;
//# sourceMappingURL=heartbeat_response.js.map