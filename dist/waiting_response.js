"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitingResponse = void 0;
class WaitingResponse {
    correlationId;
    key;
    promise;
    constructor(correlationId, key, promise) {
        this.correlationId = correlationId;
        this.key = key;
        this.promise = promise;
    }
    waitingFor(response) {
        const correlationFound = this.correlationId === response.correlationId;
        if (correlationFound && this.key !== response.key) {
            throw new Error(`Waiting response correlationId: ${this.correlationId} but key mismatch waiting: ${this.key} found ${response.key}`);
        }
        return correlationFound;
    }
    resolve(response) {
        this.promise.resolve(response);
    }
}
exports.WaitingResponse = WaitingResponse;
//# sourceMappingURL=waiting_response.js.map