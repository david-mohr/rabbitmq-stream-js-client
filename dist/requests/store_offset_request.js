"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreOffsetRequest = void 0;
const store_offset_response_1 = require("../responses/store_offset_response");
const abstract_request_1 = require("./abstract_request");
class StoreOffsetRequest extends abstract_request_1.AbstractRequest {
    responseKey = store_offset_response_1.StoreOffsetResponse.key;
    static Key = 0x000a;
    static Version = 1;
    key = StoreOffsetRequest.Key;
    reference;
    stream;
    offsetValue;
    constructor(params) {
        super();
        this.stream = params.stream;
        this.reference = params.reference;
        this.offsetValue = params.offsetValue;
    }
    writeContent(writer) {
        writer.writeString(this.reference);
        writer.writeString(this.stream);
        writer.writeUInt64(this.offsetValue);
    }
}
exports.StoreOffsetRequest = StoreOffsetRequest;
//# sourceMappingURL=store_offset_request.js.map