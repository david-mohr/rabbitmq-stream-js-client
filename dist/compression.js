"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GzipCompression = exports.NoneCompression = exports.CompressionType = void 0;
const node_zlib_1 = require("node:zlib");
var CompressionType;
(function (CompressionType) {
    CompressionType[CompressionType["None"] = 0] = "None";
    CompressionType[CompressionType["Gzip"] = 1] = "Gzip";
    // Not implemented by default.
    // It is possible to add custom codec with StreamCompressionCodecs
    CompressionType[CompressionType["Snappy"] = 2] = "Snappy";
    CompressionType[CompressionType["Lz4"] = 3] = "Lz4";
    CompressionType[CompressionType["Zstd"] = 4] = "Zstd";
})(CompressionType || (exports.CompressionType = CompressionType = {}));
class NoneCompression {
    static create() {
        return new NoneCompression();
    }
    getType() {
        return CompressionType.None;
    }
    compress(data) {
        return data;
    }
    decompress(data) {
        return data;
    }
}
exports.NoneCompression = NoneCompression;
class GzipCompression {
    static create() {
        return new GzipCompression();
    }
    getType() {
        return CompressionType.Gzip;
    }
    compress(data) {
        return (0, node_zlib_1.gzipSync)(data);
    }
    decompress(data) {
        return (0, node_zlib_1.gunzipSync)(data);
    }
}
exports.GzipCompression = GzipCompression;
//# sourceMappingURL=compression.js.map