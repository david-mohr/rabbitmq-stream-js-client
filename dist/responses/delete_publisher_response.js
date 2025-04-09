"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePublisherResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class DeletePublisherResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8006;
    static Version = 1;
    properties = {};
    constructor(response) {
        super(response);
        this.verifyKey(DeletePublisherResponse);
    }
}
exports.DeletePublisherResponse = DeletePublisherResponse;
//# sourceMappingURL=delete_publisher_response.js.map