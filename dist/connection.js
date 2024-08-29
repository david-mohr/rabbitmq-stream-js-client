"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
exports.errorMessageOf = errorMessageOf;
exports.connect = connect;
exports.create = create;
exports.partition = partition;
const crypto_1 = require("crypto");
const net_1 = require("net");
const node_tls_1 = __importDefault(require("node:tls"));
const util_1 = require("util");
const compression_1 = require("./compression");
const heartbeat_1 = require("./heartbeat");
const close_request_1 = require("./requests/close_request");
const exchange_command_versions_request_1 = require("./requests/exchange_command_versions_request");
const open_request_1 = require("./requests/open_request");
const peer_properties_request_1 = require("./requests/peer_properties_request");
const sasl_authenticate_request_1 = require("./requests/sasl_authenticate_request");
const sasl_handshake_request_1 = require("./requests/sasl_handshake_request");
const tune_request_1 = require("./requests/tune_request");
const response_decoder_1 = require("./response_decoder");
const tune_response_1 = require("./responses/tune_response");
const util_2 = require("./util");
const versions_1 = require("./versions");
const waiting_response_1 = require("./waiting_response");
const query_publisher_request_1 = require("./requests/query_publisher_request");
const store_offset_request_1 = require("./requests/store_offset_request");
const query_offset_request_1 = require("./requests/query_offset_request");
const semver_1 = require("semver");
const events_1 = __importDefault(require("events"));
function extractHeartbeatInterval(heartbeatInterval, tuneResponse) {
    return heartbeatInterval === 0 ? tuneResponse.heartbeat : Math.min(heartbeatInterval, tuneResponse.heartbeat);
}
class Connection {
    params;
    logger;
    hostname;
    leader;
    streamName;
    socket;
    correlationId = 100;
    decoder;
    receivedResponses = [];
    waitingResponses = [];
    heartbeat;
    compressions = new Map();
    peerProperties = {};
    bufferSizeSettings;
    frameMax = util_2.DEFAULT_FRAME_MAX;
    connectionId;
    connectionClosedListener;
    serverEndpoint = { host: "", port: 5552 };
    serverDeclaredVersions = [];
    refs = 0;
    filteringEnabled = false;
    userManuallyClose = false;
    setupCompleted = false;
    publisherId = 0;
    consumerId = 0;
    consumerListeners = [];
    publisherListeners = [];
    closeEventsEmitter = new events_1.default();
    constructor(params, logger) {
        this.params = params;
        this.logger = logger;
        this.hostname = params.hostname;
        this.leader = params.leader ?? false;
        this.streamName = params.streamName;
        if (params.frameMax)
            this.frameMax = params.frameMax;
        this.socket = this.createSocket();
        this.heartbeat = new heartbeat_1.Heartbeat(this, this.logger);
        this.compressions.set(compression_1.CompressionType.None, compression_1.NoneCompression.create());
        this.compressions.set(compression_1.CompressionType.Gzip, compression_1.GzipCompression.create());
        this.decoder = new response_decoder_1.ResponseDecoder((...args) => this.responseReceived(...args), this.logger);
        this.bufferSizeSettings = params.bufferSizeSettings || {};
        this.connectionId = params.connectionId ?? (0, crypto_1.randomUUID)();
        this.connectionClosedListener = params.listeners?.connection_closed;
        this.logSocket("new");
    }
    createSocket() {
        const socket = this.params.ssl
            ? node_tls_1.default.connect(this.params.port, this.params.hostname, {
                ...this.params.ssl,
                rejectUnauthorized: false,
            })
            : new net_1.Socket().connect(this.params.port, this.params.hostname);
        if (this.params.socketTimeout)
            socket.setTimeout(this.params.socketTimeout);
        return socket;
    }
    registerSocketListeners() {
        return new Promise((res, rej) => {
            this.socket.on("error", (err) => {
                this.logger.warn(`Error on connection ${this.connectionId} ${this.params.hostname}:${this.params.port} vhost:${this.params.vhost} err: ${err}`);
                return rej(err);
            });
            this.socket.on("connect", async () => {
                this.logger.info(`Connected to RabbitMQ ${this.params.hostname}:${this.params.port}`);
                this.peerProperties = (await this.exchangeProperties()).properties;
                this.filteringEnabled = (0, semver_1.lt)((0, semver_1.coerce)(this.rabbitManagementVersion), util_2.REQUIRED_MANAGEMENT_VERSION) ? false : true;
                await this.auth({
                    username: this.params.username,
                    password: this.params.password,
                    mechanism: this.params.mechanism ?? "PLAIN",
                });
                const { heartbeat } = await this.tune(this.params.heartbeat ?? 0);
                await this.open({ virtualHost: this.params.vhost });
                if (!this.heartbeat.started)
                    this.heartbeat.start(heartbeat);
                await this.exchangeCommandVersions();
                this.setupCompleted = true;
                return res(this);
            });
            this.socket.on("drain", () => this.logger.warn(`Draining ${this.params.hostname}:${this.params.port}`));
            this.socket.on("timeout", () => {
                this.logger.error(`Timeout ${this.params.hostname}:${this.params.port}`);
                return rej(new Error(`Timeout ${this.params.hostname}:${this.params.port}`));
            });
            this.socket.on("data", (data) => {
                this.heartbeat.reportLastMessageReceived();
                this.received(data);
            });
            this.socket.on("close", (had_error) => {
                this.setupCompleted = false;
                this.logger.info(`Close event on socket for connection ${this.connectionId}, close cloud had_error? ${had_error}`);
                if (this.connectionClosedListener && !this.userManuallyClose)
                    this.connectionClosedListener(had_error);
            });
        });
    }
    unregisterSocketListeners() {
        this.socket.removeAllListeners("connect");
        this.socket.removeAllListeners("drain");
        this.socket.removeAllListeners("timeout");
        this.socket.removeAllListeners("data");
        this.socket.removeAllListeners("close");
    }
    async restart() {
        this.unregisterSocketListeners();
        this.socket = this.createSocket();
        await this.registerSocketListeners();
        this.logSocket("restarted");
    }
    static connect(params, logger) {
        const connection = Connection.create(params, logger);
        return connection.start();
    }
    static create(params, logger) {
        return new Connection(params, logger);
    }
    start() {
        this.registerListeners(this.params.listeners);
        return this.registerSocketListeners();
    }
    on(event, listener) {
        switch (event) {
            case "metadata_update":
                this.decoder.on("metadata_update", listener);
                break;
            case "publish_confirm":
                this.decoder.on("publish_confirm", listener);
                break;
            case "publish_error":
                this.decoder.on("publish_error", listener);
                break;
            case "deliverV1":
                this.decoder.on("deliverV1", listener);
                break;
            case "deliverV2":
                this.decoder.on("deliverV2", listener);
                break;
            case "consumer_update_query":
                this.decoder.on("consumer_update_query", listener);
                break;
            default:
                break;
        }
    }
    logSocket(prefix = "") {
        this.logger.info(`${prefix} socket for connection ${this.connectionId}: ${(0, util_1.inspect)([
            this.socket.readable,
            this.socket.writable,
            this.socket.localAddress,
            this.socket.localPort,
            this.socket.readyState,
        ])}`);
    }
    onPublisherClosed(publisherExtendedId, streamName, callback) {
        this.publisherListeners.push({ extendedId: publisherExtendedId, stream: streamName });
        this.closeEventsEmitter.once(`close_publisher_${publisherExtendedId}`, callback);
    }
    onConsumerClosed(consumerExtendedId, streamName, callback) {
        this.consumerListeners.push({ extendedId: consumerExtendedId, stream: streamName });
        this.closeEventsEmitter.once(`close_consumer_${consumerExtendedId}`, callback);
    }
    registerListeners(listeners) {
        this.decoder.on("metadata_update", (metadata) => {
            this.publisherListeners = notifyOnceClose(this.publisherListeners, metadata, this.closeEventsEmitter, "publisher");
            this.consumerListeners = notifyOnceClose(this.consumerListeners, metadata, this.closeEventsEmitter, "consumer");
        });
        if (listeners?.metadata_update)
            this.decoder.on("metadata_update", listeners.metadata_update);
        if (listeners?.publish_confirm)
            this.decoder.on("publish_confirm", listeners.publish_confirm);
        if (listeners?.publish_error)
            this.decoder.on("publish_error", listeners.publish_error);
        if (listeners?.deliverV1)
            this.decoder.on("deliverV1", listeners.deliverV1);
        if (listeners?.deliverV2)
            this.decoder.on("deliverV2", listeners.deliverV2);
        if (listeners?.consumer_update_query)
            this.decoder.on("consumer_update_query", listeners.consumer_update_query);
    }
    getCompression(compressionType) {
        const compression = this.compressions.get(compressionType);
        if (!compression) {
            throw new Error("invalid compression or compression not yet implemented, to add a new compression use the specific api");
        }
        return compression;
    }
    registerCompression(compression) {
        const c = this.compressions.get(compression.getType());
        if (c) {
            throw new Error("compression already implemented");
        }
        this.compressions.set(compression.getType(), compression);
    }
    async exchangeCommandVersions() {
        const versions = (0, versions_1.getClientSupportedVersions)(this.peerProperties.version);
        const response = await this.sendAndWait(new exchange_command_versions_request_1.ExchangeCommandVersionsRequest(versions));
        this.serverDeclaredVersions.push(...response.serverDeclaredVersions);
        return (0, versions_1.checkServerDeclaredVersions)(this.serverVersions, this.logger, this.peerProperties.version);
    }
    sendAndWait(cmd) {
        return new Promise((res, rej) => {
            const correlationId = this.incCorrelationId();
            const bufferSizeParams = this.getBufferSizeParams();
            const body = cmd.toBuffer(bufferSizeParams, correlationId);
            this.logger.debug(`Write cmd key: ${cmd.key.toString(16)} - correlationId: ${correlationId}: data: ${(0, util_1.inspect)(body.toJSON())} length: ${body.byteLength}`);
            this.socket.write(body, (err) => {
                this.logger.debug(`Write COMPLETED for cmd key: ${cmd.key.toString(16)} - correlationId: ${correlationId} err: ${err}`);
                if (err) {
                    return rej(err);
                }
                this?.heartbeat?.reportLastMessageSent();
                res(this.waitResponse({ correlationId, key: cmd.responseKey }));
            });
        });
    }
    waitResponse({ correlationId, key }) {
        const response = (0, util_2.removeFrom)(this.receivedResponses, (r) => r.correlationId === correlationId);
        if (response) {
            if (response.key !== key) {
                throw new Error(`Error con correlationId: ${correlationId} waiting key: ${key.toString(16)} found key: ${response.key.toString(16)} `);
            }
            return response.ok ? Promise.resolve(response) : Promise.reject(response.code);
        }
        return new Promise((resolve, reject) => {
            this.waitingResponses.push(new waiting_response_1.WaitingResponse(correlationId, key, { resolve, reject }));
        });
    }
    getConnectionInfo() {
        return {
            host: this.serverEndpoint.host,
            port: this.serverEndpoint.port,
            id: this.connectionId,
            readable: this.socket.readable,
            writable: this.socket.writable,
            localPort: this.socket.localPort,
            ready: this.ready,
        };
    }
    responseReceived(response) {
        const wr = (0, util_2.removeFrom)(this.waitingResponses, (x) => x.waitingFor(response));
        return wr ? wr.resolve(response) : this.receivedResponses.push(response);
    }
    received(data) {
        this.logger.debug(`Receiving ${data.length} (${data.readUInt32BE()}) bytes ... ${(0, util_1.inspect)(data)}`);
        this.decoder.add(data, (ct) => this.getCompression(ct));
    }
    async exchangeProperties() {
        this.logger.debug(`Exchange peer properties ...`);
        const peerProperties = {
            ...peer_properties_request_1.PROPERTIES,
            connection_name: this.params.connectionName ?? peer_properties_request_1.PROPERTIES.connection_name,
        };
        const res = await this.sendAndWait(new peer_properties_request_1.PeerPropertiesRequest(peerProperties));
        if (!res.ok) {
            throw new Error(`Unable to exchange peer properties ${res.code} `);
        }
        this.logger.debug(`server properties: ${(0, util_1.inspect)(res.properties)}`);
        return res;
    }
    send(cmd) {
        return new Promise((res, rej) => {
            const bufferSizeParams = this.getBufferSizeParams();
            const body = cmd.toBuffer(bufferSizeParams);
            this.logger.debug(`Write cmd key: ${cmd.key.toString(16)} - no correlationId - data: ${(0, util_1.inspect)(body.toJSON())} length: ${body.byteLength}`);
            this.socket.write(body, (err) => {
                this.logger.debug(`Write COMPLETED for cmd key: ${cmd.key.toString(16)} - no correlationId - err: ${err}`);
                if (err) {
                    return rej(err);
                }
                return res();
            });
        });
    }
    incCorrelationId() {
        this.correlationId += 1;
        return this.correlationId;
    }
    getBufferSizeParams() {
        return { maxSize: this.frameMax, ...this.bufferSizeSettings };
    }
    get maxFrameSize() {
        return this.frameMax;
    }
    get serverVersions() {
        return [...this.serverDeclaredVersions];
    }
    get rabbitManagementVersion() {
        return this.peerProperties.version;
    }
    get isFilteringEnabled() {
        return this.filteringEnabled;
    }
    get ready() {
        return this.setupCompleted;
    }
    async auth(params) {
        this.logger.debug(`Start authentication process ...`);
        this.logger.debug(`Start SASL handshake ...`);
        const handshakeResponse = await this.sendAndWait(new sasl_handshake_request_1.SaslHandshakeRequest());
        this.logger.debug(`Mechanisms: ${handshakeResponse.mechanisms}`);
        if (!handshakeResponse.mechanisms.find((m) => m === params.mechanism)) {
            throw new Error(`Unable to find ${params.mechanism} mechanism in ${handshakeResponse.mechanisms}`);
        }
        this.logger.debug(`Start SASL ${params.mechanism} authentication ...`);
        const authResponse = await this.sendAndWait(new sasl_authenticate_request_1.SaslAuthenticateRequest(params));
        this.logger.debug(`Authentication: ${authResponse.ok} - '${authResponse.data}'`);
        if (!authResponse.ok) {
            throw new Error(`Unable Authenticate -> ${authResponse.code}`);
        }
        return authResponse;
    }
    async open(params) {
        this.logger.debug(`Open ...`);
        const res = await this.sendAndWait(new open_request_1.OpenRequest(params));
        this.logger.debug(`Open response: ${res.ok} - '${(0, util_1.inspect)(res.properties)}'`);
        const advertisedHost = res.properties["advertised_host"] ?? "";
        const advertisedPort = parseInt(res.properties["advertised_port"] ?? "5552");
        this.serverEndpoint = { host: advertisedHost, port: advertisedPort };
        return res;
    }
    async tune(heartbeatInterval) {
        const tuneResponse = await this.waitResponse({ correlationId: -1, key: tune_response_1.TuneResponse.key });
        this.logger.debug(`TUNE response -> ${(0, util_1.inspect)(tuneResponse)}`);
        const heartbeat = extractHeartbeatInterval(heartbeatInterval, tuneResponse);
        return new Promise((res, rej) => {
            this.frameMax = this.calculateFrameMaxSizeFrom(tuneResponse.frameMax);
            const request = new tune_request_1.TuneRequest({ frameMax: this.frameMax, heartbeat });
            this.socket.write(request.toBuffer(), (err) => {
                this.logger.debug(`Write COMPLETED for cmd TUNE: ${(0, util_1.inspect)(tuneResponse)} - err: ${err}`);
                return err ? rej(err) : res({ heartbeat });
            });
        });
    }
    calculateFrameMaxSizeFrom(tuneResponseFrameMax) {
        if (this.frameMax === util_2.DEFAULT_UNLIMITED_FRAME_MAX)
            return tuneResponseFrameMax;
        if (tuneResponseFrameMax === util_2.DEFAULT_UNLIMITED_FRAME_MAX)
            return this.frameMax;
        return Math.min(this.frameMax, tuneResponseFrameMax);
    }
    async close(params = { closingCode: 0, closingReason: "" }) {
        this.logger.info(`Closing connection...`);
        this.logger.info(`Stopping heartbeat...`);
        this.heartbeat.stop();
        this.logger.debug(`Close...`);
        const closeResponse = await this.sendAndWait(new close_request_1.CloseRequest(params));
        this.logger.debug(`Close response: ${closeResponse.ok} - '${(0, util_1.inspect)(closeResponse)}'`);
        this.userManuallyClose = params.manuallyClose ?? false;
        this.socket.end();
    }
    async queryPublisherSequence(params) {
        const res = await this.sendAndWait(new query_publisher_request_1.QueryPublisherRequest(params));
        if (!res.ok) {
            throw new Error(`Query Publisher Sequence command returned error with code ${res.code} - ${errorMessageOf(res.code)}`);
        }
        this.logger.info(`Sequence for stream name ${params.stream}, publisher ref ${params.publisherRef} at ${res.sequence}`);
        return res.sequence;
    }
    storeOffset(params) {
        return this.send(new store_offset_request_1.StoreOffsetRequest(params));
    }
    async queryOffset(params) {
        this.logger.debug(`Query Offset...`);
        const res = await this.sendAndWait(new query_offset_request_1.QueryOffsetRequest(params));
        if (!res.ok) {
            throw new Error(`Query offset command returned error with code ${res.code}`);
        }
        this.logger.debug(`Query Offset response: ${res.ok} with params: '${(0, util_1.inspect)(params)}'`);
        return res.offsetValue;
    }
    incrRefCount() {
        ++this.refs;
    }
    decrRefCount() {
        return --this.refs;
    }
    get refCount() {
        return this.refs;
    }
    getNextPublisherId() {
        const publisherId = this.publisherId;
        this.publisherId++;
        return publisherId;
    }
    getNextConsumerId() {
        const consumerId = this.consumerId;
        this.consumerId++;
        return consumerId;
    }
}
exports.Connection = Connection;
function errorMessageOf(code) {
    switch (code) {
        case 0x02:
            return "Stream does not exist";
        case 0x04:
            return "Subscription ID does not exist";
        case 0x06:
            return "Stream not available";
        case 0x12:
            return "Publisher does not exist";
        default:
            return "Unknown error";
    }
}
function connect(logger, params) {
    return Connection.connect(params, logger);
}
function create(logger, params) {
    return Connection.create(params, logger);
}
function notifyOnceClose(listeners, metadata, closeEventsEmitter, eventName) {
    const [toNotify, toKeep] = partition(listeners, isSameStream(metadata));
    toNotify.forEach((l) => closeEventsEmitter.emit(`close_${eventName}_${l.extendedId}`));
    return toKeep;
}
function partition(arr, predicate) {
    const [truthy, falsy] = arr.reduce((acc, t) => {
        acc[predicate(t) ? 0 : 1].push(t);
        return acc;
    }, [[], []]);
    return [truthy, falsy];
}
function isSameStream({ metadataInfo }) {
    return (e) => e.stream === metadataInfo.stream;
}
//# sourceMappingURL=connection.js.map