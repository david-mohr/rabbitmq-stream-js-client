"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishRequest = void 0;
const encoder_1 = require("../amqp10/encoder");
const abstract_request_1 = require("./abstract_request");
class PublishRequest extends abstract_request_1.AbstractRequest {
    params;
    static Key = 0x02;
    static Version = 1;
    key = PublishRequest.Key;
    responseKey = -1;
    constructor(params) {
        super();
        this.params = params;
    }
    writeContent(writer) {
        writer.writeUInt8(this.params.publisherId);
        writer.writeUInt32(this.params.messages.length);
        this.params.messages.forEach(({ publishingId, message }) => {
            writer.writeUInt64(publishingId);
            (0, encoder_1.amqpEncode)(writer, message);
        });
    }
}
exports.PublishRequest = PublishRequest;
//# sourceMappingURL=publish_request.js.map