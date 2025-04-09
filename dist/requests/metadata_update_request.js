"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataUpdateRequest = void 0;
const abstract_request_1 = require("./abstract_request");
class MetadataUpdateRequest extends abstract_request_1.AbstractRequest {
    params;
    responseKey = -1;
    static Key = 0x0010;
    static Version = 1;
    key = MetadataUpdateRequest.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(b) {
        b.writeUInt16(this.params.metadataInfo.code);
        b.writeString(this.params.metadataInfo.stream);
    }
}
exports.MetadataUpdateRequest = MetadataUpdateRequest;
//# sourceMappingURL=metadata_update_request.js.map