"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class RouteResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8018;
    streams = [];
    constructor(response) {
        super(response);
        this.verifyKey(RouteResponse);
        const numStreams = this.response.payload.readUInt32();
        for (let i = 0; i < numStreams; i++) {
            this.streams.push(this.response.payload.readString());
        }
    }
}
exports.RouteResponse = RouteResponse;
//# sourceMappingURL=route_response.js.map