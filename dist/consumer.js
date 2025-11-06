"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamConsumer = exports.computeExtendedConsumerId = void 0;
const consumer_credit_policy_1 = require("./consumer_credit_policy");
const subscribe_request_1 = require("./requests/subscribe_request");
const computeExtendedConsumerId = (consumerId, connectionId) => {
    return `${consumerId}@${connectionId}`;
};
exports.computeExtendedConsumerId = computeExtendedConsumerId;
class StreamConsumer {
    pool;
    filter;
    connection;
    stream;
    consumerId;
    consumerRef;
    consumerTag;
    offset;
    consumerUpdateListener;
    clientLocalOffset;
    creditsHandler;
    consumerHandle;
    closed;
    singleActive = false;
    constructor(pool, handle, params, filter) {
        this.pool = pool;
        this.filter = filter;
        this.connection = params.connection;
        this.stream = params.stream;
        this.consumerId = params.consumerId;
        this.consumerRef = params.consumerRef;
        this.offset = params.offset;
        this.clientLocalOffset = this.offset.clone();
        this.connection.incrRefCount();
        this.creditsHandler = params.creditPolicy || consumer_credit_policy_1.defaultCreditPolicy;
        this.consumerHandle = handle;
        this.consumerUpdateListener = params.consumerUpdateListener;
        this.closed = false;
        this.singleActive = params.singleActive ?? false;
    }
    async close() {
        this.closed = true;
        await this.pool.releaseConnection(this.connection, true);
    }
    async automaticClose() {
        this.closed = true;
        await this.pool.releaseConnection(this.connection, false);
    }
    storeOffset(offsetValue) {
        if (!this.consumerRef)
            throw new Error("ConsumerReference must be defined in order to use this!");
        const offset = offsetValue ? offsetValue : this.clientLocalOffset.value ?? 0n;
        return this.connection.storeOffset({ stream: this.stream, reference: this.consumerRef, offsetValue: offset });
    }
    queryOffset() {
        if (!this.consumerRef)
            throw new Error("ConsumerReference must be defined in order to use this!");
        return this.connection.queryOffset({ stream: this.stream, reference: this.consumerRef });
    }
    getOffset() {
        return this.clientLocalOffset.value ?? 0n;
    }
    getConnectionInfo() {
        const { host, port, id, readable, localPort, ready, vhost } = this.connection.getConnectionInfo();
        return { host, port, id, readable, localPort, ready, vhost };
    }
    async handle(message) {
        if (this.closed || this.isMessageOffsetLessThanConsumers(message))
            return;
        await this.consumerHandle(message);
        this.maybeUpdateLocalOffset(message);
    }
    get streamName() {
        return this.stream;
    }
    get extendedId() {
        return (0, exports.computeExtendedConsumerId)(this.consumerId, this.connection.connectionId);
    }
    get creditPolicy() {
        return this.creditsHandler;
    }
    get isSingleActive() {
        return this.singleActive;
    }
    updateConsumerOffset(offset) {
        this.offset = offset.clone();
        this.clientLocalOffset = offset.clone();
    }
    maybeUpdateLocalOffset(message) {
        if (message.offset !== undefined)
            this.clientLocalOffset = subscribe_request_1.Offset.offset(message.offset);
    }
    // TODO -- Find better name?
    isMessageOffsetLessThanConsumers(message) {
        return this.offset.type === "numeric" && message.offset !== undefined && message.offset < this.offset.value;
    }
}
exports.StreamConsumer = StreamConsumer;
//# sourceMappingURL=consumer.js.map