"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverResponseV2 = void 0;
const buffer_data_writer_1 = require("../requests/buffer_data_writer");
class DeliverResponseV2 {
    response;
    static key = 0x0008;
    static Version = 2;
    constructor(response) {
        this.response = response;
        if (this.response.key !== DeliverResponseV2.key) {
            throw new Error(`Unable to create ${DeliverResponseV2.name} from data of type ${this.response.key}`);
        }
    }
    toBuffer() {
        const bufferSize = 1024;
        const bufferSizeParams = { maxSize: bufferSize };
        const dw = new buffer_data_writer_1.BufferDataWriter(Buffer.alloc(bufferSize), 4, bufferSizeParams);
        dw.writeUInt16(DeliverResponseV2.key);
        dw.writeUInt16(2);
        dw.writeUInt8(this.response.subscriptionId);
        dw.writeUInt64(this.response.committedChunkId);
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
    get committedChunkId() {
        return this.response.committedChunkId;
    }
    get messages() {
        return this.response.messages;
    }
}
exports.DeliverResponseV2 = DeliverResponseV2;
//# sourceMappingURL=deliver_response_v2.js.map