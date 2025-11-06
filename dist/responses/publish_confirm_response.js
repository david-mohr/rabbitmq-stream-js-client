"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishConfirmResponse = void 0;
const buffer_data_writer_1 = require("../requests/buffer_data_writer");
class PublishConfirmResponse {
    response;
    static key = 0x0003;
    static Version = 1;
    publishingIds;
    publisherId;
    constructor(response) {
        this.response = response;
        if (this.response.key !== PublishConfirmResponse.key) {
            throw new Error(`Unable to create ${PublishConfirmResponse.name} from data of type ${this.response.key}`);
        }
        this.publishingIds = response.publishingIds;
        this.publisherId = response.publisherId;
    }
    toBuffer() {
        const bufferSize = 1024;
        const bufferSizeParams = { maxSize: bufferSize };
        const dw = new buffer_data_writer_1.BufferDataWriter(Buffer.alloc(bufferSize), 4, bufferSizeParams);
        dw.writeUInt16(PublishConfirmResponse.key);
        dw.writeUInt16(1);
        dw.writeUInt8(this.publisherId);
        dw.writeUInt32(this.publishingIds.length);
        for (const pubId of this.publishingIds) {
            dw.writeUInt64(pubId);
        }
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
}
exports.PublishConfirmResponse = PublishConfirmResponse;
//# sourceMappingURL=publish_confirm_response.js.map