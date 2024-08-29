"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamPublisher = exports.computeExtendedPublisherId = exports.AmqpByte = void 0;
const util_1 = require("util");
const encoder_1 = require("./amqp10/encoder");
const compression_1 = require("./compression");
const connection_pool_1 = require("./connection_pool");
const frame_size_exception_1 = require("./requests/frame_size_exception");
const publish_request_1 = require("./requests/publish_request");
const publish_request_v2_1 = require("./requests/publish_request_v2");
const sub_entry_batch_publish_request_1 = require("./requests/sub_entry_batch_publish_request");
const util_2 = require("./util");
class AmqpByte {
    value;
    constructor(value) {
        if (value > 255 || value < 0) {
            throw new Error("Invalid byte, value must be between 0 and 255");
        }
        this.value = value;
    }
    get byteValue() {
        return this.value;
    }
}
exports.AmqpByte = AmqpByte;
const computeExtendedPublisherId = (publisherId, connectionId) => {
    return `${publisherId}@${connectionId}`;
};
exports.computeExtendedPublisherId = computeExtendedPublisherId;
class StreamPublisher {
    filter;
    connection;
    stream;
    publisherId;
    publisherRef;
    boot;
    publishingId;
    maxFrameSize;
    queue;
    scheduled;
    logger;
    maxChunkLength;
    _closed = false;
    constructor(params, filter) {
        this.filter = filter;
        this.connection = params.connection;
        this.stream = params.stream;
        this.publisherId = params.publisherId;
        this.publisherRef = params.publisherRef || "";
        this.boot = params.boot || false;
        this.publishingId = params.boot ? -1n : 0n;
        this.maxFrameSize = params.maxFrameSize || 1048576;
        this.queue = [];
        this.scheduled = null;
        this.logger = params.logger;
        this.maxChunkLength = params.maxChunkLength || 100;
        this.connection.incrRefCount();
    }
    get closed() {
        return this._closed;
    }
    async send(message, opts = {}) {
        if (this._closed) {
            throw new Error(`Publisher has been closed`);
        }
        if (this.boot && this.publishingId === -1n) {
            this.publishingId = await this.getLastPublishingId();
        }
        this.publishingId = this.publishingId + 1n;
        return await this.basicSend(this.publishingId, message, opts);
    }
    async basicSend(publishingId, content, opts = {}) {
        const msg = { publishingId: publishingId, message: { content: content, ...opts } };
        return await this.enqueue(msg);
    }
    async flush() {
        return await this.sendBuffer();
    }
    async sendSubEntries(messages, compressionType = compression_1.CompressionType.None) {
        return this.connection.send(new sub_entry_batch_publish_request_1.SubEntryBatchPublishRequest({
            publisherId: this.publisherId,
            publishingId: this.publishingId,
            compression: this.connection.getCompression(compressionType),
            maxFrameSize: this.maxFrameSize,
            messages: messages,
        }));
    }
    getConnectionInfo() {
        const { host, port, id, writable, localPort, ready } = this.connection.getConnectionInfo();
        return { host, port, id, writable, localPort, ready };
    }
    on(event, listener) {
        switch (event) {
            case "metadata_update":
                this.connection.on("metadata_update", listener);
                break;
            case "publish_confirm":
                const cb = listener;
                this.connection.on("publish_confirm", (confirm) => cb(null, confirm.publishingIds));
                this.connection.on("publish_error", (error) => cb(error.publishingError.code, [error.publishingError.publishingId]));
                break;
            default:
                break;
        }
    }
    getLastPublishingId() {
        return this.connection.queryPublisherSequence({ stream: this.stream, publisherRef: this.publisherRef });
    }
    get ref() {
        return this.publisherRef;
    }
    async close(manuallyClose) {
        if (!this.closed) {
            await this.flush();
            this.connection.decrRefCount();
            if (connection_pool_1.ConnectionPool.removeIfUnused(this.connection)) {
                await this.connection.close({ closingCode: 0, closingReason: "", manuallyClose });
            }
        }
        this._closed = true;
    }
    get streamName() {
        return this.stream;
    }
    async enqueue(publishRequestMessage) {
        if (this.filter) {
            publishRequestMessage.filterValue = this.filter(publishRequestMessage.message);
        }
        if (!this.connection.isFilteringEnabled && this.filter) {
            throw new Error(`Your rabbit server management version does not support filtering.`);
        }
        this.checkMessageSize(publishRequestMessage);
        const sendCycleNeeded = this.add(publishRequestMessage);
        const result = { sent: false, publishingId: publishRequestMessage.publishingId };
        if (sendCycleNeeded) {
            result.sent = await this.sendBuffer();
        }
        this.scheduleIfNeeded();
        return result;
    }
    checkMessageSize(publishRequestMessage) {
        const computedSize = (0, encoder_1.messageSize)(publishRequestMessage.message);
        if (this.maxFrameSize !== util_2.DEFAULT_UNLIMITED_FRAME_MAX && computedSize > this.maxFrameSize) {
            throw new frame_size_exception_1.FrameSizeException(`Message too big to fit in one frame: ${computedSize}`);
        }
        return true;
    }
    async sendBuffer() {
        if (!this.connection.ready) {
            return false;
        }
        const chunk = this.popChunk();
        if (chunk.length > 0) {
            this.filter
                ? await this.connection.send(new publish_request_v2_1.PublishRequestV2({
                    publisherId: this.publisherId,
                    messages: chunk,
                }))
                : await this.connection.send(new publish_request_1.PublishRequest({
                    publisherId: this.publisherId,
                    messages: chunk,
                }));
            return true;
        }
        return false;
    }
    scheduleIfNeeded() {
        if (this.queue.length > 0 && this.scheduled === null) {
            this.scheduled = setImmediate(() => {
                this.scheduled = null;
                this.flush()
                    .then((_v) => _v)
                    .catch((err) => this.logger.error(`Error in send: ${(0, util_1.inspect)(err)}`))
                    .finally(() => this.scheduleIfNeeded());
            });
        }
    }
    add(message) {
        this.queue.push(message);
        return this.queue.length >= this.maxChunkLength;
    }
    popChunk() {
        return this.queue.splice(0, this.maxChunkLength);
    }
    get extendedId() {
        return (0, exports.computeExtendedPublisherId)(this.publisherId, this.connection.connectionId);
    }
}
exports.StreamPublisher = StreamPublisher;
//# sourceMappingURL=publisher.js.map