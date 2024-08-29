"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCreditPolicy = exports.creditsOnChunkCompleted = exports.creditsOnChunkReceived = exports.ConsumerCreditPolicy = void 0;
class ConsumerCreditPolicy {
    startFrom;
    constructor(startFrom) {
        this.startFrom = startFrom;
    }
    async onChunkReceived(_requestWrapper) {
        return;
    }
    async onChunkCompleted(_requestWrapper) {
        return;
    }
    async requestCredits(requestWrapper, amount) {
        return requestWrapper(amount);
    }
    onSubscription() {
        return this.startFrom;
    }
}
exports.ConsumerCreditPolicy = ConsumerCreditPolicy;
class NewCreditsOnChunkReceived extends ConsumerCreditPolicy {
    step;
    constructor(startFrom = 1, step = 1) {
        super(startFrom);
        this.step = step;
    }
    async onChunkReceived(requestWrapper) {
        await this.requestCredits(requestWrapper, this.step);
    }
    onSubscription() {
        return this.startFrom;
    }
}
class NewCreditsOnChunkCompleted extends ConsumerCreditPolicy {
    step;
    constructor(startFrom = 1, step = 1) {
        super(startFrom);
        this.step = step;
    }
    async onChunkCompleted(requestWrapper) {
        await this.requestCredits(requestWrapper, this.step);
    }
}
const creditsOnChunkReceived = (startFrom, step) => new NewCreditsOnChunkReceived(startFrom, step);
exports.creditsOnChunkReceived = creditsOnChunkReceived;
const creditsOnChunkCompleted = (startFrom, step) => new NewCreditsOnChunkCompleted(startFrom, step);
exports.creditsOnChunkCompleted = creditsOnChunkCompleted;
exports.defaultCreditPolicy = (0, exports.creditsOnChunkReceived)(2, 1);
//# sourceMappingURL=consumer_credit_policy.js.map