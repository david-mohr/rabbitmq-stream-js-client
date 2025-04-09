"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuneResponse = void 0;
const buffer_data_writer_1 = require("../requests/buffer_data_writer");
class TuneResponse {
    response;
    static key = 0x0014; // I know it isn't 8014
    static Version = 1;
    constructor(response) {
        this.response = response;
        if (this.response.key !== TuneResponse.key) {
            throw new Error(`Unable to create ${TuneResponse.name} from data of type ${this.response.key}`);
        }
    }
    toBuffer() {
        const bufferSize = 1024;
        const bufferSizeParams = { maxSize: bufferSize };
        const dw = new buffer_data_writer_1.BufferDataWriter(Buffer.alloc(bufferSize), 4, bufferSizeParams);
        dw.writeUInt16(TuneResponse.key);
        dw.writeUInt16(1);
        dw.writeUInt32(this.response.frameMax);
        dw.writeUInt32(this.response.heartbeat);
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
    get frameMax() {
        return this.response.frameMax;
    }
    get heartbeat() {
        return this.response.heartbeat;
    }
}
exports.TuneResponse = TuneResponse;
//# sourceMappingURL=tune_response.js.map