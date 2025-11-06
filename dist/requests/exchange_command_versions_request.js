"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeCommandVersionsRequest = void 0;
const exchange_command_versions_response_1 = require("../responses/exchange_command_versions_response");
const abstract_request_1 = require("./abstract_request");
class ExchangeCommandVersionsRequest extends abstract_request_1.AbstractRequest {
    versions;
    static Key = 0x001b;
    key = ExchangeCommandVersionsRequest.Key;
    static Version = 1;
    responseKey = exchange_command_versions_response_1.ExchangeCommandVersionsResponse.key;
    constructor(versions) {
        super();
        this.versions = versions;
    }
    writeContent(writer) {
        writer.writeInt32(this.versions.length);
        this.versions.forEach((entry) => {
            writer.writeUInt16(entry.key);
            writer.writeUInt16(entry.minVersion);
            writer.writeUInt16(entry.maxVersion);
        });
    }
}
exports.ExchangeCommandVersionsRequest = ExchangeCommandVersionsRequest;
//# sourceMappingURL=exchange_command_versions_request.js.map