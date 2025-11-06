"use strict";
/* eslint-disable no-param-reassign */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerPropertiesRequest = exports.PROPERTIES = void 0;
const peer_properties_response_1 = require("../responses/peer_properties_response");
const abstract_request_1 = require("./abstract_request");
exports.PROPERTIES = {
    product: "RabbitMQ Stream",
    version: "0.3.0",
    platform: "javascript",
    copyright: "Copyright (c) 2020-2024 Coders51 srl",
    information: "Licensed under the Apache 2.0 and MPL 2.0 licenses. See https://www.rabbitmq.com/",
    connection_name: "Unknown",
};
class PeerPropertiesRequest extends abstract_request_1.AbstractRequest {
    static Key = 0x11;
    static Version = 1;
    key = PeerPropertiesRequest.Key;
    responseKey = peer_properties_response_1.PeerPropertiesResponse.key;
    _properties = [];
    constructor(properties = exports.PROPERTIES) {
        super();
        this._properties = Object.keys(properties).map((key) => ({ key, value: properties[key] }));
    }
    writeContent(writer) {
        writer.writeUInt32(this._properties.length);
        this._properties.forEach(({ key, value }) => {
            writer.writeString(key);
            writer.writeString(value);
        });
    }
}
exports.PeerPropertiesRequest = PeerPropertiesRequest;
//# sourceMappingURL=peer_properties_request.js.map