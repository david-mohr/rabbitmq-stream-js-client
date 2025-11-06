"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStreamResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class CreateStreamResponse extends abstract_response_1.AbstractResponse {
    static key = 0x800d;
    static Version = 1;
    constructor(response) {
        super(response);
        this.verifyKey(CreateStreamResponse);
    }
}
exports.CreateStreamResponse = CreateStreamResponse;
//# sourceMappingURL=create_stream_response.js.map