"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeRequest = exports.Offset = void 0;
const subscribe_response_1 = require("../responses/subscribe_response");
const abstract_request_1 = require("./abstract_request");
const OFFSET_TYPE = {
    first: 1,
    last: 2,
    next: 3,
    numeric: 4,
    timestamp: 5,
};
class Offset {
    type;
    value;
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    write(writer) {
        writer.writeUInt16(OFFSET_TYPE[this.type]);
        if (this.type === "numeric" && this.value !== null && this.value !== undefined)
            writer.writeUInt64(this.value);
        if (this.type === "timestamp" && this.value)
            writer.writeInt64(this.value);
    }
    static first() {
        return new Offset("first");
    }
    static last() {
        return new Offset("last");
    }
    static next() {
        return new Offset("next");
    }
    static offset(offset) {
        return new Offset("numeric", offset);
    }
    static timestamp(date) {
        return new Offset("timestamp", BigInt(date.getTime()));
    }
    clone() {
        return new Offset(this.type, this.value);
    }
}
exports.Offset = Offset;
class SubscribeRequest extends abstract_request_1.AbstractRequest {
    params;
    static Key = 0x0007;
    static Version = 1;
    key = SubscribeRequest.Key;
    responseKey = subscribe_response_1.SubscribeResponse.key;
    _properties = [];
    constructor(params) {
        super();
        this.params = params;
        if (params.properties)
            this._properties = Object.keys(params.properties).map((key) => ({ key, value: params.properties[key] }));
    }
    writeContent(writer) {
        writer.writeUInt8(this.params.subscriptionId);
        writer.writeString(this.params.stream);
        this.params.offset.write(writer);
        writer.writeUInt16(this.params.credit);
        writer.writeUInt32(this._properties.length);
        this._properties.forEach(({ key, value }) => {
            writer.writeString(key);
            writer.writeString(value);
        });
    }
}
exports.SubscribeRequest = SubscribeRequest;
//# sourceMappingURL=subscribe_request.js.map