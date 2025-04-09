"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerPropertiesResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class PeerPropertiesResponse extends abstract_response_1.AbstractResponse {
    static key = 0x8011;
    static Version = 1;
    properties = {};
    constructor(response) {
        super(response);
        this.verifyKey(PeerPropertiesResponse);
        const howMany = this.response.payload.readInt32();
        for (let index = 0; index < howMany; index++) {
            const resKey = this.response.payload.readString();
            const resValue = this.response.payload.readString();
            this.properties[resKey] = resValue;
        }
    }
}
exports.PeerPropertiesResponse = PeerPropertiesResponse;
//# sourceMappingURL=peer_properties_response.js.map