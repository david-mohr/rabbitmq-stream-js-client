"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishRequestV2 = void 0;
const encoder_1 = require("../amqp10/encoder");
const abstract_request_1 = require("./abstract_request");
class PublishRequestV2 extends abstract_request_1.AbstractRequest {
    params;
    static Key = 0x02;
    static Version = 2;
    key = PublishRequestV2.Key;
    responseKey = -1;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeUInt8(this.params.publisherId);
        writer.writeUInt32(this.params.messages.length);
        this.params.messages.forEach(({ publishingId, filterValue, message }) => {
            writer.writeUInt64(publishingId);
            filterValue ? writer.writeString(filterValue) : writer.writeInt16(-1);
            (0, encoder_1.amqpEncode)(writer, message);
        });
    }
    get version() {
        return PublishRequestV2.Version;
    }
}
exports.PublishRequestV2 = PublishRequestV2;
//# sourceMappingURL=publish_request_v2.js.map