"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeCommandVersionsResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class ExchangeCommandVersionsResponse extends abstract_response_1.AbstractResponse {
    static key = 0x801b;
    static Version = 1;
    serverDeclaredVersions;
    constructor(response) {
        super(response);
        this.verifyKey(ExchangeCommandVersionsResponse);
        this.serverDeclaredVersions = [];
        const serverDeclaredVersionsCount = response.payload.readInt32();
        for (let i = 0; i < serverDeclaredVersionsCount; i++) {
            const declaredVersion = {
                key: response.payload.readUInt16(),
                minVersion: response.payload.readUInt16(),
                maxVersion: response.payload.readUInt16(),
            };
            this.serverDeclaredVersions.push(declaredVersion);
        }
    }
}
exports.ExchangeCommandVersionsResponse = ExchangeCommandVersionsResponse;
//# sourceMappingURL=exchange_command_versions_response.js.map