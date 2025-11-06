"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubEntryBatchPublishRequest = void 0;
const encoder_1 = require("../amqp10/encoder");
const abstract_request_1 = require("./abstract_request");
class SubEntryBatchPublishRequest extends abstract_request_1.AbstractRequest {
    params;
    static Key = 0x02;
    static Version = 1;
    key = SubEntryBatchPublishRequest.Key;
    responseKey = -1;
    maxFrameSize;
    constructor(params) {
        super();
        this.params = params;
        this.maxFrameSize = params.maxFrameSize;
    }
    writeContent(writer) {
        const { compression, messages, publishingId, publisherId } = this.params;
        writer.writeUInt8(publisherId);
        // number of root messages. In this case will be always 1
        writer.writeUInt32(1);
        writer.writeUInt64(publishingId);
        writer.writeByte(this.encodeCompressionType(compression.getType()));
        writer.writeUInt16(messages.length);
        writer.writeUInt32(messages.reduce((sum, message) => sum + 4 + (0, encoder_1.messageSize)(message), 0));
        const initialDataBufferSize = 65536;
        const bufferSizeParams = { maxSize: this.maxFrameSize };
        const data = new abstract_request_1.BufferDataWriter(Buffer.alloc(initialDataBufferSize), 0, bufferSizeParams);
        messages.forEach((m) => (0, encoder_1.amqpEncode)(data, m));
        const compressedData = compression.compress(data.toBuffer());
        writer.writeUInt32(compressedData.length);
        writer.writeData(compressedData);
    }
    encodeCompressionType(compressionType) {
        return 0x80 | (compressionType << 4);
    }
}
exports.SubEntryBatchPublishRequest = SubEntryBatchPublishRequest;
//# sourceMappingURL=sub_entry_batch_publish_request.js.map