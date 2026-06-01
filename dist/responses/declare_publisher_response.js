"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclarePublisherResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class DeclarePublisherResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8001;
    static Version = 1;
    properties = {};
    constructor(response) {
        super(response);
        this.verifyKey(DeclarePublisherResponse);
    }
}
exports.DeclarePublisherResponse = DeclarePublisherResponse;
//# sourceMappingURL=declare_publisher_response.js.map