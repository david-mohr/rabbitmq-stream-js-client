"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataRequest = void 0;
const metadata_response_1 = require("../responses/metadata_response");
const abstract_request_1 = require("./abstract_request");
class MetadataRequest extends abstract_request_1.AbstractRequest {
    params;
    responseKey = metadata_response_1.MetadataResponse.key;
    static Key = 0x000f;
    static Version = 1;
    key = MetadataRequest.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeInt32(this.params.streams.length);
        this.params.streams.forEach((s) => {
            writer.writeString(s);
        });
    }
}
exports.MetadataRequest = MetadataRequest;
//# sourceMappingURL=metadata_request.js.map