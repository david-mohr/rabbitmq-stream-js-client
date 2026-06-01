"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamPublisher = exports.computeExtendedPublisherId = exports.AmqpByte = void 0;
const util_1 = require("util");
const encoder_1 = require("./amqp10/encoder");
const compression_1 = require("./compression");
const frame_size_exception_1 = require("./requests/frame_size_exception");
const publish_request_1 = require("./requests/publish_request");
const publish_request_v2_1 = require("./requests/publish_request_v2");
const sub_entry_batch_publish_request_1 = require("./requests/sub_entry_batch_publish_request");
const util_2 = require("./util");
/**
 * Represents a single byte value for AMQP encoding
 *
 * Used when you need to explicitly specify a byte-sized value in message annotations.
 */
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
/**
 * Compute an extended publisher ID that includes the connection ID
 *
 * @param publisherId - The numeric publisher ID
 * @param connectionId - The connection ID
 * @returns An extended publisher ID in the format "publisherId@connectionId"
 */
const computeExtendedPublisherId = (publisherId, connectionId) => {
    return `${publisherId}@${connectionId}`;
};
exports.computeExtendedPublisherId = computeExtendedPublisherId;
/**
 * Implementation of a stream publisher
 *
 * StreamPublisher handles message publishing to a RabbitMQ stream with features:
 * - Automatic message batching based on maxChunkLength
 * - Deduplication via monotonically increasing publishing IDs
 * - Server-side filtering via filter functions
 * - Sub-batch entry publishing with optional compression (Gzip, etc.)
 * - Frame size validation to prevent oversized messages
 *
 * Messages are queued internally and sent in batches for optimal performance.
 * The publisher automatically schedules flushes when the queue reaches maxChunkLength.
 *
 * @example
 * ```typescript
 * // Basic publisher
 * const publisher = await client.declarePublisher({ stream: 'my-stream' });
 * await publisher.send(Buffer.from('Hello World'));
 * await publisher.close();
 *
 * // Publisher with deduplication
 * const dedupPublisher = await client.declarePublisher({
 *   stream: 'my-stream',
 *   publisherRef: 'my-publisher-ref'
 * });
 * await dedupPublisher.send(Buffer.from('Message 1'));
 * await dedupPublisher.send(Buffer.from('Message 2'));
 *
 * // Publisher with filtering
 * const filterPublisher = await client.declarePublisher(
 *   { stream: 'my-stream' },
 *   (msg) => msg.applicationProperties?.region
 * );
 * await filterPublisher.send(Buffer.from('Data'), {
 *   applicationProperties: { region: 'us-east-1' }
 * });
 * ```
 */
class StreamPublisher {
    pool;
    filter;
    connection;
    stream;
    publisherId;
    publisherRef;
    publishingId;
    maxFrameSize;
    queue;
    scheduled;
    logger;
    maxChunkLength;
    _closed = false;
    constructor(pool, params, publishingId, filter) {
        this.pool = pool;
        this.filter = filter;
        this.connection = params.connection;
        this.stream = params.stream;
        this.publisherId = params.publisherId;
        this.publisherRef = params.publisherRef || "";
        this.publishingId = publishingId;
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
        let publishingIdToSend;
        if (this.publisherRef && opts.publishingId) {
            publishingIdToSend = opts.publishingId;
            if (opts.publishingId > this.publishingId) {
                this.publishingId = opts.publishingId;
            }
        }
        else {
            this.publishingId = this.publishingId + 1n;
            publishingIdToSend = this.publishingId;
        }
        return await this.basicSend(publishingIdToSend, message, opts);
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
        const { host, port, id, writable, localPort, ready, vhost } = this.connection.getConnectionInfo();
        return { host, port, id, writable, localPort, ready, vhost };
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
    async close() {
        if (!this.closed) {
            await this.flush();
            await this.pool.releaseConnection(this.connection, true);
        }
        this._closed = true;
    }
    async automaticClose() {
        if (!this.closed) {
            await this.flush();
            await this.pool.releaseConnection(this.connection, false);
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
        const result = {
            sent: false,
            publishingId: publishRequestMessage.publishingId,
            publisherId: this.publisherId,
            connectionId: this.connection.connectionId,
        };
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