"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerUpdateQuery = void 0;
const buffer_data_writer_1 = require("../requests/buffer_data_writer");
class ConsumerUpdateQuery {
    response;
    static key = 0x001a;
    static Version = 1;
    constructor(response) {
        this.response = response;
        if (this.response.key !== ConsumerUpdateQuery.key) {
            throw new Error(`Unable to create ${ConsumerUpdateQuery.name} from data of type ${this.response.key}`);
        }
    }
    toBuffer() {
        const bufferSize = 1024;
        const bufferSizeParams = { maxSize: bufferSize };
        const dw = new buffer_data_writer_1.BufferDataWriter(Buffer.alloc(bufferSize), 4, bufferSizeParams);
        dw.writeUInt16(ConsumerUpdateQuery.key);
        dw.writeUInt16(1);
        dw.writeUInt32(this.response.correlationId);
        dw.writeUInt8(this.response.subscriptionId);
        dw.writeUInt8(this.response.active);
        dw.writePrefixSize();
        return dw.toBuffer();
    }
    get key() {
        return this.response.key;
    }
    get correlationId() {
        return this.response.correlationId;
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
    get active() {
        return this.response.active;
    }
}
exports.ConsumerUpdateQuery = ConsumerUpdateQuery;
//# sourceMappingURL=consumer_update_query.js.map