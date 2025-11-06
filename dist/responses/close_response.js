"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class CloseResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8016;
    static Version = 1;
    constructor(response) {
        super(response);
        this.verifyKey(CloseResponse);
    }
}
exports.CloseResponse = CloseResponse;
//# sourceMappingURL=close_response.js.map