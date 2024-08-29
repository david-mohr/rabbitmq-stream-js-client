"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataResponse = void 0;
const abstract_response_1 = require("./abstract_response");
class MetadataResponse extends abstract_response_1.AbstractResponse {
    static key = 0x800f;
    static Version = 1;
    streamInfos = [];
    constructor(response) {
        super(response);
        this.verifyKey(MetadataResponse);
        const payload = response.payload;
        const brokers = [];
        const noOfBrokers = payload.readInt32();
        for (let i = 0; i < noOfBrokers; i++) {
            brokers.push({
                reference: payload.readUInt16(),
                host: payload.readString(),
                port: payload.readUInt32(),
            });
        }
        const noOfStreamInfos = payload.readInt32();
        for (let i = 0; i < noOfStreamInfos; i++) {
            const streamName = payload.readString();
            const streamInfo = {
                streamName,
                responseCode: payload.readUInt16(),
            };
            const leaderReference = payload.readUInt16();
            const replicasReferences = this.readReplicasReferencesFrom(response.payload);
            const leader = brokers?.find((b) => b.reference === leaderReference);
            const replicas = brokers?.filter((b) => replicasReferences.includes(b.reference));
            this.streamInfos.push({ ...streamInfo, leader, replicas });
        }
    }
    readReplicasReferencesFrom(payload) {
        const replicasReferences = [];
        const howMany = payload.readInt32();
        for (let index = 0; index < howMany; index++) {
            const reference = payload.readUInt16();
            replicasReferences.push(reference);
        }
        return replicasReferences;
    }
    get ok() {
        return true;
    }
}
exports.MetadataResponse = MetadataResponse;
//# sourceMappingURL=metadata_response.js.map