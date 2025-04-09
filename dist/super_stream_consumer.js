"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperStreamConsumer = void 0;
const consumer_credit_policy_1 = require("./consumer_credit_policy");
class SuperStreamConsumer {
    handle;
    consumers = new Map();
    consumerRef;
    superStream;
    locator;
    partitions;
    offset;
    creditPolicy;
    constructor(handle, params) {
        this.handle = handle;
        this.superStream = params.superStream;
        this.consumerRef = params.consumerRef;
        this.locator = params.locator;
        this.partitions = params.partitions;
        this.offset = params.offset;
        this.creditPolicy = params.creditPolicy || consumer_credit_policy_1.defaultCreditPolicy;
    }
    async start() {
        await Promise.all(this.partitions.map(async (p) => {
            const partitionConsumer = await this.locator.declareConsumer({
                stream: p,
                consumerRef: this.consumerRef,
                offset: this.offset,
                singleActive: true,
                creditPolicy: this.creditPolicy,
            }, this.handle, this);
            this.consumers.set(p, partitionConsumer);
            return;
        }));
    }
    static async create(handle, params) {
        const superStreamConsumer = new SuperStreamConsumer(handle, params);
        await superStreamConsumer.start();
        return superStreamConsumer;
    }
    async close() {
        await Promise.all([...this.consumers.values()].map((c) => c.close(true)));
    }
}
exports.SuperStreamConsumer = SuperStreamConsumer;
//# sourceMappingURL=super_stream_consumer.js.map