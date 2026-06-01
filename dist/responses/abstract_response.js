"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractResponse = void 0;
class AbstractResponse {
    response;
    constructor(response) {
        this.response = response;
    }
    verifyKey(type) {
        if (this.response.key !== type.key) {
            throw new Error(`Unable to create ${type.name} from data of type ${this.response.key}`);
        }
    }
    get key() {
        return this.response.key;
    }
    get correlationId() {
        return this.response.correlationId;
    }
    get code() {
        return this.response.code;
    }
    get ok() {
        return this.code === 0x01;
    }
}
exports.AbstractResponse = AbstractResponse;
//# sourceMappingURL=abstract_response.js.map