"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamConsumer = exports.computeExtendedConsumerId = void 0;
const connection_pool_1 = require("./connection_pool");
const consumer_credit_policy_1 = require("./consumer_credit_policy");
const subscribe_request_1 = require("./requests/subscribe_request");
const computeExtendedConsumerId = (consumerId, connectionId) => {
    return `${consumerId}@${connectionId}`;
};
exports.computeExtendedConsumerId = computeExtendedConsumerId;
class StreamConsumer {
    filter;
    connection;
    stream;
    consumerId;
    consumerRef;
    offset;
    clientLocalOffset;
    creditsHandler;
    consumerHandle;
    closed;
    constructor(handle, params, filter) {
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
        this.closed = false;
    }
    async close(manuallyClose) {
        this.closed = true;
        this.connection.decrRefCount();
        if (connection_pool_1.ConnectionPool.removeIfUnused(this.connection)) {
            await this.connection.close({ closingCode: 0, closingReason: "", manuallyClose });
        }
    }
    storeOffset(offsetValue) {
        if (!this.consumerRef)
            throw new Error("ConsumerReference must be defined in order to use this!");
        return this.connection.storeOffset({ stream: this.stream, reference: this.consumerRef, offsetValue });
    }
    queryOffset() {
        if (!this.consumerRef)
            throw new Error("ConsumerReference must be defined in order to use this!");
        return this.connection.queryOffset({ stream: this.stream, reference: this.consumerRef });
    }
    getConnectionInfo() {
        const { host, port, id, readable, localPort, ready } = this.connection.getConnectionInfo();
        return { host, port, id, readable, localPort, ready };
    }
    get localOffset() {
        return this.clientLocalOffset.clone();
    }
    handle(message) {
        if (this.closed || this.isMessageOffsetLessThanConsumers(message))
            return;
        this.consumerHandle(message);
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