"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseDecoder = exports.BufferDataReader = void 0;
exports.readUTF8String = readUTF8String;
exports.decodeBooleanType = decodeBooleanType;
exports.decodeFormatCode = decodeFormatCode;
const events_1 = require("events");
const util_1 = require("util");
const applicationProperties_1 = require("./amqp10/applicationProperties");
const decoder_1 = require("./amqp10/decoder");
const messageAnnotations_1 = require("./amqp10/messageAnnotations");
const messageHeader_1 = require("./amqp10/messageHeader");
const properties_1 = require("./amqp10/properties");
const close_response_1 = require("./responses/close_response");
const create_stream_response_1 = require("./responses/create_stream_response");
const credit_response_1 = require("./responses/credit_response");
const declare_publisher_response_1 = require("./responses/declare_publisher_response");
const delete_publisher_response_1 = require("./responses/delete_publisher_response");
const delete_stream_response_1 = require("./responses/delete_stream_response");
const deliver_response_1 = require("./responses/deliver_response");
const heartbeat_response_1 = require("./responses/heartbeat_response");
const metadata_update_response_1 = require("./responses/metadata_update_response");
const open_response_1 = require("./responses/open_response");
const peer_properties_response_1 = require("./responses/peer_properties_response");
const publish_confirm_response_1 = require("./responses/publish_confirm_response");
const publish_error_response_1 = require("./responses/publish_error_response");
const query_offset_response_1 = require("./responses/query_offset_response");
const query_publisher_response_1 = require("./responses/query_publisher_response");
const sasl_authenticate_response_1 = require("./responses/sasl_authenticate_response");
const sasl_handshake_response_1 = require("./responses/sasl_handshake_response");
const store_offset_response_1 = require("./responses/store_offset_response");
const stream_stats_response_1 = require("./responses/stream_stats_response");
const subscribe_response_1 = require("./responses/subscribe_response");
const tune_response_1 = require("./responses/tune_response");
const unsubscribe_response_1 = require("./responses/unsubscribe_response");
const metadata_response_1 = require("./responses/metadata_response");
const exchange_command_versions_response_1 = require("./responses/exchange_command_versions_response");
const route_response_1 = require("./responses/route_response");
const partitions_response_1 = require("./responses/partitions_response");
const consumer_update_query_1 = require("./responses/consumer_update_query");
const create_super_stream_response_1 = require("./responses/create_super_stream_response");
const delete_super_stream_response_1 = require("./responses/delete_super_stream_response");
const deliver_response_v2_1 = require("./responses/deliver_response_v2");
// Frame => Size (Request | Response | Command)
//   Size => uint32 (size without the 4 bytes of the size element)
//
// Response => Key Version CorrelationId ResponseCode
//   Key => uint16
//   Version => uint16
//   CorrelationId => uint32
//   ResponseCode => uint16
const UINT32_SIZE = 4;
function decode(data, getCompressionBy, logger) {
    if (data.available() < UINT32_SIZE)
        return { completed: false, response: data.readBufferOf(data.available()) };
    const size = data.readUInt32();
    if (size > data.available()) {
        data.rewind(UINT32_SIZE);
        return { completed: false, response: data.readBufferOf(data.available()) };
    }
    return { completed: true, response: decodeResponse(data.readTo(size), size, getCompressionBy, logger) };
}
function decodeResponse(dataResponse, size, getCompressionBy, logger) {
    const key = dataResponse.readUInt16();
    const version = dataResponse.readUInt16();
    if (key === deliver_response_1.DeliverResponse.key) {
        const { subscriptionId, committedChunkId, messages } = decodeDeliverResponse(dataResponse, getCompressionBy, logger, version);
        return {
            size,
            key: key,
            version,
            subscriptionId,
            committedChunkId,
            messages,
        };
    }
    if (key === tune_response_1.TuneResponse.key) {
        const frameMax = dataResponse.readUInt32();
        const heartbeat = dataResponse.readUInt32();
        return { size, key, version, frameMax, heartbeat };
    }
    if (key === consumer_update_query_1.ConsumerUpdateQuery.key) {
        const correlationId = dataResponse.readUInt32();
        const subscriptionId = dataResponse.readUInt8();
        const active = dataResponse.readUInt8();
        const data = { size, key, version, correlationId, subscriptionId, active };
        logger.info((0, util_1.inspect)(data));
        return data;
    }
    if (key === heartbeat_response_1.HeartbeatResponse.key) {
        return { key, version };
    }
    if (key === metadata_update_response_1.MetadataUpdateResponse.key) {
        const metadataInfo = {
            code: dataResponse.readUInt16(),
            stream: dataResponse.readString(),
        };
        return { size, key, version, metadataInfo };
    }
    if (key === credit_response_1.CreditResponse.key) {
        const responseCode = dataResponse.readUInt16();
        const subscriptionId = dataResponse.readUInt8();
        const response = {
            size,
            key,
            version,
            responseCode,
            subscriptionId,
        };
        return response;
    }
    if (key === publish_confirm_response_1.PublishConfirmResponse.key) {
        const publisherId = dataResponse.readUInt8();
        const publishingIds = [];
        const howManyPublishingIds = dataResponse.readUInt32();
        for (let i = 0; i < howManyPublishingIds; i++) {
            const publishingId = dataResponse.readUInt64();
            publishingIds.push(publishingId);
        }
        const response = {
            size,
            key: key,
            version,
            publisherId,
            publishingIds,
        };
        return response;
    }
    const correlationId = dataResponse.readUInt32();
    const code = dataResponse.readUInt16();
    if (key === metadata_response_1.MetadataResponse.key) {
        // metadata response doesn't contain a code
        dataResponse.rewind(2);
    }
    const payload = dataResponse.readToEnd();
    return { size, key, version, correlationId, code, payload };
}
function decodeDeliverResponse(dataResponse, getCompressionBy, logger, version = 1) {
    const subscriptionId = dataResponse.readUInt8();
    const committedChunkId = version === 2 ? dataResponse.readUInt64() : undefined;
    const magicVersion = dataResponse.readInt8();
    const chunkType = dataResponse.readInt8();
    const numEntries = dataResponse.readUInt16();
    const numRecords = dataResponse.readUInt32();
    const timestamp = dataResponse.readInt64();
    const epoch = dataResponse.readUInt64();
    const chunkFirstOffset = dataResponse.readUInt64();
    const chunkCrc = dataResponse.readInt32();
    const dataLength = dataResponse.readUInt32();
    const trailerLength = dataResponse.readUInt32();
    const reserved = dataResponse.readUInt32();
    const messageType = dataResponse.readUInt8();
    const messages = [];
    const data = {
        committedChunkId,
        magicVersion,
        chunkType,
        numEntries,
        numRecords,
        timestamp,
        epoch,
        chunkFirstOffset,
        chunkCrc,
        dataLength,
        trailerLength,
        reserved,
        messageType, // indicate if it contains subentries
    };
    logger.debug((0, util_1.inspect)(data));
    if (messageType === 0) {
        dataResponse.rewind(1); // if not a sub entry, the messageType is part of the message
        for (let i = 0; i < numEntries; i++) {
            messages.push(decodeMessage(dataResponse, chunkFirstOffset + BigInt(i)));
        }
    }
    else {
        const compressionType = (messageType & 0x70) >> 4;
        const compression = getCompressionBy(compressionType);
        messages.push(...decodeSubEntries(dataResponse, compression, logger));
    }
    return { subscriptionId, committedChunkId, messages };
}
const EmptyBuffer = Buffer.from("");
function decodeMessage(dataResponse, offset) {
    const messageLength = dataResponse.readUInt32();
    const startFrom = dataResponse.position();
    let content = EmptyBuffer;
    let messageAnnotations = {};
    let messageProperties = {};
    let messageHeader = {};
    let amqpValue = "";
    let applicationProperties = {};
    while (dataResponse.position() - startFrom !== messageLength) {
        const formatCode = readFormatCodeType(dataResponse);
        switch (formatCode) {
            case decoder_1.FormatCodeType.ApplicationData:
                content = decodeApplicationData(dataResponse);
                break;
            case decoder_1.FormatCodeType.MessageAnnotations:
                messageAnnotations = decodeMessageAnnotations(dataResponse);
                break;
            case decoder_1.FormatCodeType.MessageProperties:
                messageProperties = decodeMessageProperties(dataResponse);
                break;
            case decoder_1.FormatCodeType.ApplicationProperties:
                applicationProperties = decodeApplicationProperties(dataResponse);
                break;
            case decoder_1.FormatCodeType.MessageHeader:
                messageHeader = decodeMessageHeader(dataResponse);
                break;
            case decoder_1.FormatCodeType.AmqpValue:
                amqpValue = decodeAmqpValue(dataResponse);
                break;
            default:
                throw new Error(`Not supported format code ${formatCode}`);
        }
    }
    return { content, messageProperties, messageHeader, applicationProperties, amqpValue, messageAnnotations, offset };
}
function decodeSubEntries(dataResponse, compression, logger) {
    const decodedMessages = [];
    const noOfRecords = dataResponse.readUInt16();
    const uncompressedLength = dataResponse.readUInt32();
    const compressedLength = dataResponse.readUInt32();
    const decompressedData = new BufferDataReader(compression.decompress(dataResponse.readBufferOf(compressedLength)));
    logger.debug(`Decoding sub entries, uncompressed length is ${uncompressedLength} while actual length is ${compressedLength}`);
    for (let i = 0; i < noOfRecords; i++) {
        const entry = decodeMessage(decompressedData, BigInt(i));
        decodedMessages.push(entry);
    }
    return decodedMessages;
}
function decodeApplicationProperties(dataResponse) {
    const formatCode = dataResponse.readUInt8();
    const applicationPropertiesLength = decodeFormatCode(dataResponse, formatCode);
    return applicationProperties_1.ApplicationProperties.parse(dataResponse, applicationPropertiesLength);
}
function decodeMessageAnnotations(dataResponse) {
    const formatCode = dataResponse.readUInt8();
    const messageAnnotationsLength = decodeFormatCode(dataResponse, formatCode);
    return messageAnnotations_1.Annotations.parse(dataResponse, messageAnnotationsLength);
}
function decodeMessageProperties(dataResponse) {
    dataResponse.rewind(3);
    const type = dataResponse.readInt8();
    if (type !== 0) {
        throw new Error(`invalid composite header: ${type}`);
    }
    const nextType = dataResponse.readInt8();
    decodeFormatCode(dataResponse, nextType);
    const formatCode = dataResponse.readUInt8();
    const propertiesLength = decodeFormatCode(dataResponse, formatCode);
    return properties_1.Properties.parse(dataResponse, propertiesLength);
}
function decodeMessageHeader(dataResponse) {
    dataResponse.rewind(3);
    const type = dataResponse.readInt8();
    if (type !== 0) {
        throw new Error(`invalid composite header: ${type}`);
    }
    // next, the composite type is encoded as an AMQP uint8
    dataResponse.readUInt64();
    const formatCode = dataResponse.readUInt8();
    const headerLength = decodeFormatCode(dataResponse, formatCode);
    return messageHeader_1.Header.parse(dataResponse, headerLength);
}
function decodeApplicationData(dataResponse) {
    const formatCode = dataResponse.readUInt8();
    const length = decodeFormatCode(dataResponse, formatCode);
    return dataResponse.readBufferOf(length);
}
function decodeAmqpValue(dataResponse) {
    const amqpFormatCode = dataResponse.readUInt8();
    dataResponse.rewind(1);
    return decodeFormatCode(dataResponse, amqpFormatCode, true);
}
function readFormatCodeType(dataResponse) {
    dataResponse.readUInt8();
    dataResponse.readUInt8();
    return dataResponse.readUInt8();
}
function readUTF8String(dataResponse) {
    const formatCode = dataResponse.readUInt8();
    const decodedString = decodeFormatCode(dataResponse, formatCode);
    if (!decodedString)
        throw new Error(`invalid formatCode %#02x: ${formatCode}`);
    return decodedString;
}
function decodeBooleanType(dataResponse, defaultValue) {
    const boolType = dataResponse.readInt8();
    switch (boolType) {
        case decoder_1.FormatCode.Bool:
            const boolValue = dataResponse.readInt8();
            return boolValue !== 0;
        case decoder_1.FormatCode.BoolTrue:
            return true;
        case decoder_1.FormatCode.BoolFalse:
            return false;
        default:
            return defaultValue;
    }
}
function decodeFormatCode(dataResponse, formatCode, skipByte = false) {
    switch (formatCode) {
        case decoder_1.FormatCode.Map8:
            // Read first empty byte
            dataResponse.readUInt8();
            return dataResponse.readUInt8();
        case decoder_1.FormatCode.Map32:
            // Read first empty four bytes
            dataResponse.readUInt32();
            return dataResponse.readUInt32();
        case decoder_1.FormatCode.SmallUlong:
            return dataResponse.readInt8(); // Read a SmallUlong
        case decoder_1.FormatCode.Ubyte:
            dataResponse.forward(1);
            return dataResponse.readUInt8();
        case decoder_1.FormatCode.ULong:
            return dataResponse.readUInt64(); // Read an ULong
        case decoder_1.FormatCode.List0:
            return 0;
        case decoder_1.FormatCode.List8:
            dataResponse.forward(1);
            return dataResponse.readInt8(); // Read length of List8
        case decoder_1.FormatCode.List32:
            dataResponse.forward(4);
            return dataResponse.readInt32();
        case decoder_1.FormatCode.Vbin8:
            return dataResponse.readUInt8();
        case decoder_1.FormatCode.Vbin32:
            return dataResponse.readUInt32();
        case decoder_1.FormatCode.Str8:
        case decoder_1.FormatCode.Sym8:
            if (skipByte)
                dataResponse.forward(1);
            return dataResponse.readString8();
        case decoder_1.FormatCode.Str32:
        case decoder_1.FormatCode.Sym32:
            if (skipByte)
                dataResponse.forward(1);
            return dataResponse.readString32();
        case decoder_1.FormatCode.Uint0:
            return 0;
        case decoder_1.FormatCode.SmallUint:
            dataResponse.forward(1); // Skipping formatCode
            return dataResponse.readUInt8();
        case decoder_1.FormatCode.Uint:
            dataResponse.forward(1); // Skipping formatCode
            return dataResponse.readUInt32();
        case decoder_1.FormatCode.SmallInt:
            dataResponse.forward(1); // Skipping formatCode
            return dataResponse.readInt8();
        case decoder_1.FormatCode.Int:
            dataResponse.forward(1); // Skipping formatCode
            return dataResponse.readInt32();
        case decoder_1.FormatCode.Bool:
        case decoder_1.FormatCode.BoolTrue:
        case decoder_1.FormatCode.BoolFalse:
            return decodeBooleanType(dataResponse, true);
        case decoder_1.FormatCode.Null:
            dataResponse.forward(1); // Skipping formatCode
            return 0;
        default:
            throw new Error(`ReadCompositeHeader Invalid type ${formatCode}`);
    }
}
class BufferDataReader {
    data;
    offset = 0;
    constructor(data) {
        this.data = data;
    }
    readTo(size) {
        const ret = new BufferDataReader(this.data.subarray(this.offset, this.offset + size));
        this.offset += size;
        return ret;
    }
    readBufferOf(size) {
        const ret = Buffer.from(this.data.subarray(this.offset, this.offset + size));
        this.offset += size;
        return ret;
    }
    readToEnd() {
        const ret = new BufferDataReader(this.data.subarray(this.offset));
        this.offset = this.data.length;
        return ret;
    }
    readInt8() {
        const ret = this.data.readInt8(this.offset);
        this.offset += 1;
        return ret;
    }
    readInt64() {
        const ret = this.data.readBigInt64BE(this.offset);
        this.offset += 8;
        return ret;
    }
    readUInt8() {
        const ret = this.data.readUInt8(this.offset);
        this.offset += 1;
        return ret;
    }
    readUInt16() {
        const ret = this.data.readUInt16BE(this.offset);
        this.offset += 2;
        return ret;
    }
    readUInt32() {
        const ret = this.data.readUInt32BE(this.offset);
        this.offset += 4;
        return ret;
    }
    readUInt64() {
        const ret = this.data.readBigUInt64BE(this.offset);
        this.offset += 8;
        return ret;
    }
    readDouble() {
        const ret = this.data.readDoubleBE(this.offset);
        this.offset += 8;
        return ret;
    }
    readFloat() {
        const ret = this.data.readFloatBE(this.offset);
        this.offset += 4;
        return ret;
    }
    readInt32() {
        const ret = this.data.readInt32BE(this.offset);
        this.offset += 4;
        return ret;
    }
    readString() {
        const size = this.readUInt16();
        const value = this.data.toString("utf8", this.offset, this.offset + size);
        this.offset += size;
        return value;
    }
    readString8() {
        const sizeStr8 = this.readUInt8();
        const valueStr8 = this.data.toString("utf8", this.offset, this.offset + sizeStr8);
        this.offset += sizeStr8;
        return valueStr8;
    }
    readString32() {
        const sizeStr32 = this.readUInt32();
        const valueStr32 = this.data.toString("utf8", this.offset, this.offset + sizeStr32);
        this.offset += sizeStr32;
        return valueStr32;
    }
    rewind(count) {
        this.offset -= count;
    }
    forward(count) {
        this.offset += count;
    }
    position() {
        return this.offset;
    }
    isAtEnd() {
        return this.offset === this.data.length;
    }
    available() {
        return Buffer.byteLength(this.data) - this.offset;
    }
}
exports.BufferDataReader = BufferDataReader;
function isTuneResponse(params) {
    return params.key === tune_response_1.TuneResponse.key;
}
function isConsumerUpdateQuery(params) {
    return params.key === consumer_update_query_1.ConsumerUpdateQuery.key;
}
function isHeartbeatResponse(params) {
    return params.key === heartbeat_response_1.HeartbeatResponse.key;
}
function isMetadataUpdateResponse(params) {
    return params.key === metadata_update_response_1.MetadataUpdateResponse.key;
}
function isDeliverResponseV1(params) {
    return params.key === deliver_response_1.DeliverResponse.key && params.version === deliver_response_1.DeliverResponse.Version;
}
function isDeliverResponseV2(params) {
    return params.key === deliver_response_v2_1.DeliverResponseV2.key && params.version === deliver_response_v2_1.DeliverResponseV2.Version;
}
function isCreditResponse(params) {
    return params.key === credit_response_1.CreditResponse.key;
}
function isPublishConfirmResponse(params) {
    return params.key === publish_confirm_response_1.PublishConfirmResponse.key;
}
function isPublishErrorResponse(params) {
    return params.key === publish_error_response_1.PublishErrorResponse.key;
}
class ResponseDecoder {
    listener;
    logger;
    responseFactories = new Map();
    emitter = new events_1.EventEmitter();
    lastData = Buffer.from("");
    constructor(listener, logger) {
        this.listener = listener;
        this.logger = logger;
        this.addFactoryFor(peer_properties_response_1.PeerPropertiesResponse);
        this.addFactoryFor(sasl_handshake_response_1.SaslHandshakeResponse);
        this.addFactoryFor(sasl_authenticate_response_1.SaslAuthenticateResponse);
        this.addFactoryFor(open_response_1.OpenResponse);
        this.addFactoryFor(close_response_1.CloseResponse);
        this.addFactoryFor(declare_publisher_response_1.DeclarePublisherResponse);
        this.addFactoryFor(delete_publisher_response_1.DeletePublisherResponse);
        this.addFactoryFor(create_stream_response_1.CreateStreamResponse);
        this.addFactoryFor(create_super_stream_response_1.CreateSuperStreamResponse);
        this.addFactoryFor(delete_stream_response_1.DeleteStreamResponse);
        this.addFactoryFor(delete_super_stream_response_1.DeleteSuperStreamResponse);
        this.addFactoryFor(query_publisher_response_1.QueryPublisherResponse);
        this.addFactoryFor(subscribe_response_1.SubscribeResponse);
        this.addFactoryFor(unsubscribe_response_1.UnsubscribeResponse);
        this.addFactoryFor(stream_stats_response_1.StreamStatsResponse);
        this.addFactoryFor(store_offset_response_1.StoreOffsetResponse);
        this.addFactoryFor(query_offset_response_1.QueryOffsetResponse);
        this.addFactoryFor(metadata_response_1.MetadataResponse);
        this.addFactoryFor(exchange_command_versions_response_1.ExchangeCommandVersionsResponse);
        this.addFactoryFor(route_response_1.RouteResponse);
        this.addFactoryFor(partitions_response_1.PartitionsResponse);
    }
    add(data, getCompressionBy) {
        const dataReader = new BufferDataReader(Buffer.concat([this.lastData, data]));
        this.lastData = Buffer.from("");
        while (!dataReader.isAtEnd()) {
            const { completed, response } = decode(dataReader, getCompressionBy, this.logger);
            if (!completed) {
                this.lastData = response;
                continue;
            }
            if (isHeartbeatResponse(response)) {
                this.logger.debug(`heartbeat received from the server: ${(0, util_1.inspect)(response)}`);
            }
            else if (isTuneResponse(response)) {
                this.emitTuneResponseReceived(response);
                this.logger.debug(`tune received from the server: ${(0, util_1.inspect)(response)}`);
            }
            else if (isConsumerUpdateQuery(response)) {
                this.emitter.emit("consumer_update_query", new consumer_update_query_1.ConsumerUpdateQuery(response));
                this.logger.debug(`consumer update query received from the server: ${(0, util_1.inspect)(response)}`);
            }
            else if (isMetadataUpdateResponse(response)) {
                this.emitter.emit("metadata_update", new metadata_update_response_1.MetadataUpdateResponse(response));
                this.logger.debug(`metadata update received from the server: ${(0, util_1.inspect)(response)}`);
            }
            else if (isDeliverResponseV1(response)) {
                this.emitter.emit("deliverV1", new deliver_response_1.DeliverResponse(response));
                this.logger.debug(`deliverV1 received from the server: ${(0, util_1.inspect)(response)}`);
            }
            else if (isDeliverResponseV2(response)) {
                this.emitter.emit("deliverV2", new deliver_response_v2_1.DeliverResponseV2(response));
                this.logger.debug(`deliverV2 received from the server: ${(0, util_1.inspect)(response)}`);
            }
            else if (isCreditResponse(response)) {
                this.logger.debug(`credit received from the server: ${(0, util_1.inspect)(response)}`);
                this.emitter.emit("credit_response", new credit_response_1.CreditResponse(response));
            }
            else if (isPublishConfirmResponse(response)) {
                this.emitter.emit("publish_confirm", new publish_confirm_response_1.PublishConfirmResponse(response));
                this.logger.debug(`publish confirm received from the server: ${(0, util_1.inspect)(response)}`);
            }
            else if (isPublishErrorResponse(response)) {
                this.emitter.emit("publish_error", new publish_error_response_1.PublishErrorResponse(response));
                this.logger.debug(`publish error received from the server: ${(0, util_1.inspect)(response)}`);
            }
            else {
                this.emitResponseReceived(response);
            }
        }
    }
    on(event, listener) {
        this.emitter.on(event, listener);
    }
    addFactoryFor(type) {
        this.responseFactories.set(type.key, type);
    }
    emitTuneResponseReceived(response) {
        this.listener(new tune_response_1.TuneResponse(response));
    }
    emitResponseReceived(response) {
        const value = this.getFactoryFor(response.key);
        // TODO: this if should be removed when we have implemented the publish confirm
        if (!value)
            return;
        this.listener(new value(response));
    }
    getFactoryFor(key) {
        const value = this.responseFactories.get(key);
        // TODO: this undefined and verify of 3 should be removed when we have implemented the publish confirm command
        if (!value && key !== 3) {
            throw new Error(`Unknown response ${key}`);
        }
        return value;
    }
}
exports.ResponseDecoder = ResponseDecoder;
//# sourceMappingURL=response_decoder.js.map