"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuneRequest = void 0;
const tune_response_1 = require("../responses/tune_response");
const abstract_request_1 = require("./abstract_request");
class TuneRequest extends abstract_request_1.AbstractRequest {
    params;
    responseKey = tune_response_1.TuneResponse.key;
    static Key = 0x0014;
    static Version = 1;
    key = TuneRequest.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(b) {
        b.writeUInt32(this.params.frameMax);
        b.writeUInt32(this.params.heartbeat);
    }
}
exports.TuneRequest = TuneRequest;
//# sourceMappingURL=tune_request.js.map