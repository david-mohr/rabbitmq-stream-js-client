"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRequest = void 0;
const open_response_1 = require("../responses/open_response");
const abstract_request_1 = require("./abstract_request");
class OpenRequest extends abstract_request_1.AbstractRequest {
    params;
    responseKey = open_response_1.OpenResponse.key;
    static Key = 0x0015;
    static Version = 1;
    key = OpenRequest.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeString(this.params.virtualHost);
    }
}
exports.OpenRequest = OpenRequest;
//# sourceMappingURL=open_request.js.map