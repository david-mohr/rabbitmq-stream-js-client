"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditResponse = void 0;
const buffer_data_writer_1 = require("../requests/buffer_data_writer");
class CreditResponse {
    response;
    static key = 0x8009;
    static Version = 1;
    constructor(response) {
        this.response = response;
        if (this.response.key !== CreditResponse.key) {
            throw new Error(`Unable to create ${CreditResponse.name} from data of type ${this.response.key}`);
        }
    }
    toBuffer() {
        const bufferSize = 1024;
        const bufferSizeParams = { maxSize: bufferSize };
        const dw = new buffer_data_writer_1.BufferDataWriter(Buffer.alloc(bufferSize), 4, bufferSizeParams);
        dw.writeUInt16(CreditResponse.key);
        dw.writeUInt16(1);
        dw.writeUInt16(this.response.responseCode);
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
    get responseCode() {
        return this.response.responseCode;
    }
    get subscriptionId() {
        return this.response.subscriptionId;
    }
}
exports.CreditResponse = CreditResponse;
//# sourceMappingURL=credit_response.js.map