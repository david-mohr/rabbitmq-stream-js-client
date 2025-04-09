"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteQuery = void 0;
const route_response_1 = require("../responses/route_response");
const abstract_request_1 = require("./abstract_request");
class RouteQuery extends abstract_request_1.AbstractRequest {
    params;
    responseKey = route_response_1.RouteResponse.key;
    static Key = 0x0018;
    static Version = 1;
    key = RouteQuery.Key;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeString(this.params.routingKey);
        writer.writeString(this.params.superStream);
    }
}
exports.RouteQuery = RouteQuery;
//# sourceMappingURL=route_query.js.map