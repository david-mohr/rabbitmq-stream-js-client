"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteStreamResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class DeleteStreamResponse extends abstract_response_1.AbstractResponse {
    static key = 0x800e;
    static Version = 1;
    constructor(response) {
        super(response);
        this.verifyKey(DeleteStreamResponse);
    }
}
exports.DeleteStreamResponse = DeleteStreamResponse;
//# sourceMappingURL=delete_stream_response.js.map