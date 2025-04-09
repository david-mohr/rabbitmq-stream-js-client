"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class OpenResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8015;
    static Version = 1;
    properties = {};
    constructor(response) {
        super(response);
        this.verifyKey(OpenResponse);
        const howMany = this.response.payload.readInt32();
        for (let index = 0; index < howMany; index++) {
            const resKey = this.response.payload.readString();
            const resValue = this.response.payload.readString();
            this.properties[resKey] = resValue;
        }
    }
    get data() {
        // TODO how to manage this data??
        return this.response.payload.toString();
    }
}
exports.OpenResponse = OpenResponse;
//# sourceMappingURL=open_response.js.map