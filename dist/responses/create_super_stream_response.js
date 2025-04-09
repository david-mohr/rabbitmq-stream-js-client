"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSuperStreamResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class CreateSuperStreamResponse extends abstract_response_1.AbstractResponse {
    static key = 0x801d;
    static Version = 1;
    constructor(response) {
        super(response);
        this.verifyKey(CreateSuperStreamResponse);
    }
}
exports.CreateSuperStreamResponse = CreateSuperStreamResponse;
//# sourceMappingURL=create_super_stream_response.js.map