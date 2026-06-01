"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverResponse = void 0;
const buffer_data_writer_1 = require("../requests/buffer_data_writer");
class DeliverResponse {
    response;
    static key = 0x0008;
    static Version = 1;
    constructor(response) {
        this.response = response;
        if (this.response.key !== DeliverResponse.key) {
            throw new Error(`Unable to create ${DeliverResponse.name} from data of type ${this.response.key}`);
        }
    }
    toBuffer() {
        const bufferSize = 1024;
        const bufferSizeParams = { maxSize: bufferSize };
        const dw = new buffer_data_writer_1.BufferDataWriter(Buffer.alloc(bufferSize), 4, bufferSizeParams);
        dw.writeUInt16(DeliverResponse.key);
        dw.writeUInt16(1);
        dw.writeUInt8(this.response.subscriptionId);
        dw.writePrefixSize();
        return dw.toBuffer();
    }
    get key() {
        return this.response.key;
    }
    get correlationId() {
        return -1;
    }
    get code() {
        return -1;
    }
    get ok() {
        return true;
    }
    get subscriptionId() {
        return this.response.subscriptionId;
    }
    get messages() {
        return this.response.messages;
    }
}
exports.DeliverResponse = DeliverResponse;
//# sourceMappingURL=deliver_response.js.map