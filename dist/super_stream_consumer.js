"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperStreamConsumer = void 0;
class SuperStreamConsumer {
    handle;
    consumers = new Map();
    consumerRef;
    locator;
    partitions;
    offset;
    constructor(handle, params) {
        this.handle = handle;
        this.consumerRef = params.consumerRef;
        this.locator = params.locator;
        this.partitions = params.partitions;
        this.offset = params.offset;
    }
    async start() {
        await Promise.all(this.partitions.map(async (p) => {
            const partitionConsumer = await this.locator.declareConsumer({ stream: p, consumerRef: this.consumerRef, offset: this.offset, singleActive: true }, this.handle);
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