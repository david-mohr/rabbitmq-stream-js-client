"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientSupportedVersions = getClientSupportedVersions;
exports.checkServerDeclaredVersions = checkServerDeclaredVersions;
const requests = __importStar(require("./requests/requests"));
const responses = __importStar(require("./responses/responses"));
const util_1 = require("./util");
const semver_1 = require("semver");
const supportedRequests = [
    requests.CloseRequest,
    requests.CreateStreamRequest,
    requests.CreateSuperStreamRequest,
    requests.CreditRequest,
    requests.DeclarePublisherRequest,
    requests.DeletePublisherRequest,
    requests.DeleteStreamRequest,
    requests.DeleteSuperStreamRequest,
    requests.ExchangeCommandVersionsRequest,
    requests.HeartbeatRequest,
    requests.MetadataRequest,
    requests.MetadataUpdateRequest,
    requests.OpenRequest,
    requests.PeerPropertiesRequest,
    requests.PublishRequest,
    requests.PublishRequestV2,
    requests.QueryOffsetRequest,
    requests.QueryPublisherRequest,
    requests.SaslAuthenticateRequest,
    requests.SaslHandshakeRequest,
    requests.StoreOffsetRequest,
    requests.StreamStatsRequest,
    requests.SubscribeRequest,
    requests.TuneRequest,
    requests.UnsubscribeRequest,
    requests.RouteQuery,
    requests.PartitionsQuery,
];
const supportedResponses = [
    responses.DeliverResponse,
    responses.DeliverResponseV2,
    responses.PublishConfirmResponse,
    responses.PublishErrorResponse,
    responses.ConsumerUpdateQuery,
];
function maybeAddMaxVersion(values, key, version) {
    const currentMaxValue = values.get(key);
    if (currentMaxValue === undefined || currentMaxValue < version)
        values.set(key, version);
}
function maybeAddMinVersion(values, key, version) {
    const currentMinValue = values.get(key);
    if (currentMinValue === undefined || currentMinValue > version)
        values.set(key, version);
}
function getClientSupportedVersions(serverVersion) {
    const minValues = new Map();
    const maxValues = new Map();
    supportedRequests.forEach((requestClass) => {
        maybeAddMaxVersion(maxValues, requestClass.Key, requestClass.Version);
        maybeAddMinVersion(minValues, requestClass.Key, requestClass.Version);
    });
    supportedResponses.forEach((responseClass) => {
        maybeAddMaxVersion(maxValues, responseClass.key, responseClass.Version);
        maybeAddMinVersion(minValues, responseClass.key, responseClass.Version);
    });
    const result = [];
    for (const k of minValues.keys()) {
        const minVersion = minValues.get(k);
        const maxVersion = maxValues.get(k);
        result.push({ key: k, minVersion: minVersion, maxVersion: maxVersion });
    }
    if (serverVersion && (0, semver_1.lt)((0, semver_1.coerce)(serverVersion), util_1.REQUIRED_MANAGEMENT_VERSION)) {
        const filteredResult = result.filter((r) => ![requests.CreateSuperStreamRequest.Key, requests.DeleteSuperStreamRequest.Key].includes(r.key));
        return filteredResult.map((r) => {
            if (r.key === requests.PublishRequest.Key || r.key === responses.DeliverResponse.key) {
                return { key: r.key, minVersion: r.minVersion, maxVersion: 1 };
            }
            return r;
        });
    }
    return result;
}
function indexVersions(versions) {
    const result = new Map();
    versions.forEach((v) => result.set(v.key, v));
    return result;
}
function checkVersion(key, minVersion, maxVersion, compared, logger) {
    if (minVersion > 1 && compared === undefined) {
        logger.error(`For message key ${key.toString(16)} version mismatch between client and server`);
        return false;
    }
    if (compared === undefined)
        return true;
    if (minVersion > compared.maxVersion || compared.minVersion > maxVersion) {
        logger.error(`For message key ${key.toString(16)} version mismatch between client and server`);
        return false;
    }
    return true;
}
function checkVersions(side1Versions, side2Versions, logger) {
    let result = true;
    for (const e of side1Versions.entries()) {
        const [key, side1Version] = e;
        const side2Version = side2Versions.get(key);
        result = result && checkVersion(key, side1Version.minVersion, side1Version.maxVersion, side2Version, logger);
    }
    return result;
}
function checkServerDeclaredVersions(serverDeclaredVersions, logger, serverVersion) {
    const indexedClientVersions = indexVersions(getClientSupportedVersions(serverVersion));
    const indexedServerVersions = indexVersions(serverDeclaredVersions);
    return (checkVersions(indexedClientVersions, indexedServerVersions, logger) &&
        checkVersions(indexedServerVersions, indexedClientVersions, logger));
}
//# sourceMappingURL=versions.js.map