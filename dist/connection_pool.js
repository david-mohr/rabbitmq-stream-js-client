"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPool = void 0;
const util_1 = require("./util");
class ConnectionPool {
    static consumerConnectionProxies = new Map();
    static publisherConnectionProxies = new Map();
    static getUsableCachedConnection(purpose, streamName, host) {
        const map = purpose === "publisher" ? ConnectionPool.publisherConnectionProxies : ConnectionPool.consumerConnectionProxies;
        const key = ConnectionPool.getCacheKey(streamName, host);
        const proxies = map.get(key) || [];
        const connection = proxies.at(-1);
        const refCount = connection?.refCount;
        return refCount !== undefined && refCount < (0, util_1.getMaxSharedConnectionInstances)() ? connection : undefined;
    }
    static cacheConnection(purpose, streamName, host, client) {
        const map = purpose === "publisher" ? ConnectionPool.publisherConnectionProxies : ConnectionPool.consumerConnectionProxies;
        const key = ConnectionPool.getCacheKey(streamName, host);
        const currentlyCached = map.get(key) || [];
        currentlyCached.push(client);
        map.set(key, currentlyCached);
    }
    static removeIfUnused(connection) {
        if (connection.refCount <= 0) {
            ConnectionPool.removeCachedConnection(connection);
            return true;
        }
        return false;
    }
    static removeCachedConnection(connection) {
        const { leader, streamName, hostname: host } = connection;
        if (streamName === undefined)
            return;
        const m = leader ? ConnectionPool.publisherConnectionProxies : ConnectionPool.consumerConnectionProxies;
        const k = ConnectionPool.getCacheKey(streamName, host);
        const mappedClientList = m.get(k);
        if (mappedClientList) {
            const filtered = mappedClientList.filter((c) => c !== connection);
            m.set(k, filtered);
        }
    }
    static getCacheKey(streamName, host) {
        return `${streamName}@${host}`;
    }
}
exports.ConnectionPool = ConnectionPool;
//# sourceMappingURL=connection_pool.js.map