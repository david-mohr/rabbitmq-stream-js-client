"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishErrorResponse = void 0;
const buffer_data_writer_1 = require("../requests/buffer_data_writer");
class PublishErrorResponse {
    response;
    static key = 0x0004;
    static Version = 1;
    publisherId;
    publishingError;
    constructor(response) {
        this.response = response;
        if (this.response.key !== PublishErrorResponse.key) {
            throw new Error(`Unable to create ${PublishErrorResponse.name} from data of type ${this.response.key}`);
        }
        this.publishingError = { publishingId: response.publishingId, code: response.code };
        this.publisherId = response.publisherId;
    }
    toBuffer() {
        const bufferSize = 1024;
        const bufferSizeParams = { maxSize: bufferSize };
        const dw = new buffer_data_writer_1.BufferDataWriter(Buffer.alloc(bufferSize), 4, bufferSizeParams);
        dw.writeUInt16(PublishErrorResponse.key);
        dw.writeUInt16(1);
        dw.writeUInt8(this.publisherId);
        dw.writeUInt64(this.publishingError.publishingId);
        dw.writeUInt16(this.publishingError.code);
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
exports.PublishErrorResponse = PublishErrorResponse;
//# sourceMappingURL=publish_error_response.js.map