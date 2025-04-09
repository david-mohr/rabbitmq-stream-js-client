"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperStreamPublisher = void 0;
const compression_1 = require("./compression");
const murmur32_1 = require("./hash/murmur32");
const util_1 = require("./util");
class SuperStreamPublisher {
    locator;
    partitions = [];
    publishers = new Map();
    superStream;
    publisherRef;
    keyExtractor;
    routingStrategy;
    routingCache = new Map();
    constructor(params) {
        this.locator = params.locator;
        this.publisherRef = params.publisherRef;
        this.superStream = params.superStream;
        this.routingStrategy = params.routingStrategy ?? "hash";
        this.keyExtractor = params.keyExtractor;
    }
    static async create(params) {
        const superStreamPublisher = new SuperStreamPublisher(params);
        await superStreamPublisher.start();
        return superStreamPublisher;
    }
    async start() {
        this.partitions = await this.locator.queryPartitions({ superStream: this.superStream });
    }
    async close() {
        await Promise.all([...this.publishers.values()].map((p) => p.close(true)));
        this.publishers = new Map();
    }
    async send(message, opts) {
        const partition = await this.routeMessage(message, opts);
        const publisher = await this.getPublisher(partition);
        return publisher.send(message, opts);
    }
    async basicSend(publishingId, message, opts) {
        const partition = await this.routeMessage(message, opts);
        const publisher = await this.getPublisher(partition);
        return publisher.basicSend(publishingId, message, opts);
    }
    async sendSubEntries(messages, compressionType = compression_1.CompressionType.None) {
        // route all messages
        const messagesByPartition = new Map();
        await Promise.all(messages.map(async (m) => {
            const partition = await this.routeMessage(m.content, m);
            let msgs = messagesByPartition.get(partition);
            if (!msgs) {
                msgs = [];
                messagesByPartition.set(partition, msgs);
            }
            msgs.push(m);
        }));
        // init all publishers, in sequence in order to avoid instantiating two publishers for the same node
        const partitions = [...messagesByPartition.keys()];
        for (const p of partitions) {
            await this.getPublisher(p);
        }
        // send all messages in parallel
        await Promise.all(partitions.map(async (p) => {
            const pub = await this.getPublisher(p);
            return pub.sendSubEntries(messagesByPartition.get(p) ?? [], compressionType);
        }));
    }
    async getLastPublishingId() {
        return (0, util_1.bigIntMax)(await Promise.all([...this.publishers.values()].map((p) => p.getLastPublishingId()))) ?? 0n;
    }
    async routeMessage(messageContent, msg) {
        const routingKey = this.keyExtractor(messageContent.toString(), msg);
        if (!routingKey) {
            throw new Error(`Routing key is empty or undefined with the provided extractor`);
        }
        let partition = this.routingCache.get(routingKey);
        if (!partition) {
            if (this.routingStrategy === "hash") {
                const hash = (0, murmur32_1.murmur32)(routingKey);
                const partitionIndex = hash % this.partitions.length;
                partition = this.partitions[partitionIndex];
            }
            else {
                const targetPartitions = await this.locator.routeQuery({ routingKey, superStream: this.superStream });
                if (!targetPartitions.length) {
                    throw new Error(`The server did not return any partition for routing key: ${routingKey}`);
                }
                partition = targetPartitions.find((tp) => this.partitions.find((p) => p === tp));
                if (!partition) {
                    throw new Error(`Key routing strategy failed: server returned partitions ${targetPartitions} but no match was found`);
                }
            }
        }
        this.routingCache.set(routingKey, partition);
        return partition;
    }
    async getPublisher(partition) {
        const publisher = this.publishers.get(partition);
        if (publisher) {
            return publisher;
        }
        return this.initPublisher(partition);
    }
    async initPublisher(partition) {
        const publisher = await this.locator.declarePublisher({ stream: partition, publisherRef: this.publisherRef });
        this.publishers.set(partition, publisher);
        return publisher;
    }
}
exports.SuperStreamPublisher = SuperStreamPublisher;
//# sourceMappingURL=super_stream_publisher.js.map