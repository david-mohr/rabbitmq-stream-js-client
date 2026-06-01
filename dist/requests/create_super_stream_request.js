"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSuperStreamRequest = void 0;
const create_super_stream_response_1 = require("../responses/create_super_stream_response");
const abstract_request_1 = require("./abstract_request");
class CreateSuperStreamRequest extends abstract_request_1.AbstractRequest {
    responseKey = create_super_stream_response_1.CreateSuperStreamResponse.key;
    static Key = 0x001d;
    static Version = 1;
    key = CreateSuperStreamRequest.Key;
    _arguments = [];
    streamName;
    partitions;
    bindingKeys;
    constructor(params) {
        super();
        if (params.arguments) {
            this._arguments = Object.keys(params.arguments).map((key) => {
                return {
                    key,
                    value: params.arguments[key] ?? "",
                };
            });
        }
        this.streamName = params.streamName;
        this.partitions = params.partitions;
        this.bindingKeys = params.bindingKeys;
    }
    writeContent(writer) {
        writer.writeString(this.streamName);
        writer.writeInt32(this.partitions.length);
        this.partitions.forEach((partition) => writer.writeString(partition));
        writer.writeInt32(this.bindingKeys.length);
        this.bindingKeys.forEach((bindingKey) => writer.writeString(bindingKey));
        writer.writeUInt32(this._arguments?.length ?? 0);
        this._arguments.forEach(({ key, value }) => {
            writer.writeString(key);
            writer.writeString(value.toString());
        });
    }
}
exports.CreateSuperStreamRequest = CreateSuperStreamRequest;
//# sourceMappingURL=create_super_stream_request.js.map