"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPool = void 0;
const util_1 = require("util");
const util_2 = require("./util");
class ConnectionPool {
    log;
    connectionsMap = new Map();
    constructor(log) {
        this.log = log;
    }
    async getConnection(entityType, streamName, vhost, host, connectionCreator) {
        const key = this.getCacheKey(streamName, vhost, host, entityType);
        const connections = this.connectionsMap.get(key) || [];
        const connection = connections.at(-1);
        const refCount = connection?.refCount;
        const cachedConnection = refCount !== undefined && refCount < (0, util_2.getMaxSharedConnectionInstances)() ? connection : undefined;
        if (cachedConnection) {
            return cachedConnection;
        }
        else {
            const newConnection = await connectionCreator();
            this.cacheConnection(key, newConnection);
            return newConnection;
        }
    }
    async releaseConnection(connection, manuallyClose = true) {
        connection.decrRefCount();
        if (connection.refCount <= 0 && connection.ready) {
            try {
                await connection.close({ closingCode: 0, closingReason: "", manuallyClose });
            }
            catch (e) {
                // in case the client is closed immediately after a consumer, its connection has still not
                // reset the ready flag, so we get an "Error: write after end"
                this.log.warn(`Could not close connection: ${(0, util_1.inspect)(e)}`);
            }
            this.removeCachedConnection(connection);
        }
    }
    cacheConnection(key, connection) {
        const currentlyCached = this.connectionsMap.get(key) || [];
        currentlyCached.push(connection);
        this.connectionsMap.set(key, currentlyCached);
    }
    removeCachedConnection(connection) {
        const { leader, streamName, hostname: host, vhost } = connection;
        if (streamName === undefined)
            return;
        const entityType = leader ? "publisher" : "consumer";
        const k = this.getCacheKey(streamName, vhost, host, entityType);
        const mappedClientList = this.connectionsMap.get(k);
        if (mappedClientList) {
            const filtered = mappedClientList.filter((c) => c !== connection);
            this.connectionsMap.set(k, filtered);
        }
    }
    getCacheKey(streamName, vhost, host, entityType) {
        return `${streamName}@${vhost}@${host}@${entityType}`;
    }
}
exports.ConnectionPool = ConnectionPool;
//# sourceMappingURL=connection_pool.js.map