"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStreamRequest = void 0;
const create_stream_response_1 = require("../responses/create_stream_response");
const abstract_request_1 = require("./abstract_request");
class CreateStreamRequest extends abstract_request_1.AbstractRequest {
    responseKey = create_stream_response_1.CreateStreamResponse.key;
    static Key = 0x000d;
    static Version = 1;
    key = CreateStreamRequest.Key;
    _arguments = [];
    stream;
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
        this.stream = params.stream;
    }
    writeContent(writer) {
        writer.writeString(this.stream);
        writer.writeUInt32(this._arguments?.length ?? 0);
        this._arguments.forEach(({ key, value }) => {
            writer.writeString(key);
            writer.writeString(value.toString());
        });
    }
}
exports.CreateStreamRequest = CreateStreamRequest;
//# sourceMappingURL=create_stream_request.js.map