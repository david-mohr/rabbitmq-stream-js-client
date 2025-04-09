"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataUpdateResponse = void 0;
const buffer_data_writer_1 = require("../requests/buffer_data_writer");
class MetadataUpdateResponse {
    response;
    static key = 0x0010;
    static Version = 1;
    constructor(response) {
        this.response = response;
        if (this.response.key !== MetadataUpdateResponse.key) {
            throw new Error(`Unable to create ${MetadataUpdateResponse.name} from data of type ${this.response.key}`);
        }
    }
    toBuffer() {
        const bufferSize = 1024;
        const bufferSizeParams = { maxSize: bufferSize };
        const dw = new buffer_data_writer_1.BufferDataWriter(Buffer.alloc(bufferSize), 4, bufferSizeParams);
        dw.writeUInt16(MetadataUpdateResponse.key);
        dw.writeUInt16(1);
        dw.writeUInt16(this.response.metadataInfo.code);
        dw.writeString(this.response.metadataInfo.stream);
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
    get metadataInfo() {
        return this.response.metadataInfo;
    }
}
exports.MetadataUpdateResponse = MetadataUpdateResponse;
//# sourceMappingURL=metadata_update_response.js.map