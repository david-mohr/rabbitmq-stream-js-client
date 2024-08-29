"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigIntMax = exports.sample = exports.getAddressResolverFromEnv = exports.getMaxSharedConnectionInstances = exports.REQUIRED_MANAGEMENT_VERSION = exports.DEFAULT_UNLIMITED_FRAME_MAX = exports.DEFAULT_FRAME_MAX = void 0;
exports.removeFrom = removeFrom;
exports.range = range;
function removeFrom(l, predicate) {
    const i = l.findIndex(predicate);
    if (i === -1)
        return;
    const [e] = l.splice(i, 1);
    return e;
}
function range(count) {
    const ret = Array(count);
    for (let index = 0; index < count; index++) {
        ret[index] = index;
    }
    return ret;
}
exports.DEFAULT_FRAME_MAX = 1048576;
exports.DEFAULT_UNLIMITED_FRAME_MAX = 0;
exports.REQUIRED_MANAGEMENT_VERSION = "3.13.0";
const getMaxSharedConnectionInstances = () => {
    return Math.max(+(process.env.MAX_SHARED_CLIENT_INSTANCES ?? 100), 256);
};
exports.getMaxSharedConnectionInstances = getMaxSharedConnectionInstances;
const getAddressResolverFromEnv = () => {
    const envValue = process.env.RABBIT_MQ_TEST_ADDRESS_BALANCER ?? "localhost:5552";
    const [host, port] = envValue.split(":");
    return { host: host ?? "localhost", port: parseInt(port) ?? 5553 };
};
exports.getAddressResolverFromEnv = getAddressResolverFromEnv;
const sample = (items) => {
    const actualItems = items.filter((c) => !!c);
    if (!actualItems.length) {
        return undefined;
    }
    const index = Math.floor(Math.random() * actualItems.length);
    return actualItems[index];
};
exports.sample = sample;
const bigIntMax = (n) => {
    if (!n.length)
        return undefined;
    return n.reduce((acc, i) => (i > acc ? i : acc), n[0]);
};
exports.bigIntMax = bigIntMax;
//# sourceMappingURL=util.js.map