"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSuperStreamResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class DeleteSuperStreamResponse extends abstract_response_1.AbstractResponse {
    static key = 0x801e;
    static Version = 1;
    constructor(response) {
        super(response);
        this.verifyKey(DeleteSuperStreamResponse);
    }
}
exports.DeleteSuperStreamResponse = DeleteSuperStreamResponse;
//# sourceMappingURL=delete_super_stream_response.js.map