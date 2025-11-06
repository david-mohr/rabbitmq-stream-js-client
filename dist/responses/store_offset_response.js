"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreOffsetResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class StoreOffsetResponse extends abstract_response_1.AbstractResponse {
    static key = 0x000a;
    static Version = 1;
    constructor(response) {
        super(response);
        this.verifyKey(StoreOffsetResponse);
    }
}
exports.StoreOffsetResponse = StoreOffsetResponse;
//# sourceMappingURL=store_offset_response.js.map