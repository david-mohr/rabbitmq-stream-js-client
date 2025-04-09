"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionsResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class PartitionsResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8019;
    streams = [];
    constructor(response) {
        super(response);
        this.verifyKey(PartitionsResponse);
        const numStreams = this.response.payload.readInt32();
        for (let i = 0; i < numStreams; i++) {
            this.streams.push(this.response.payload.readString());
        }
    }
}
exports.PartitionsResponse = PartitionsResponse;
//# sourceMappingURL=partitions_response.js.map