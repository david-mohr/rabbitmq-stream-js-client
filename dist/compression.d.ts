export declare enum CompressionType {
    None = 0,
    Gzip = 1,
    Snappy = 2,
    Lz4 = 3,
    Zstd = 4
}
export interface Compression {
    getType(): CompressionType;
    compress(data: Buffer): Buffer;
    decompress(data: Buffer): Buffer;
}
export declare class NoneCompression implements Compression {
    static create(): NoneCompression;
    getType(): CompressionType;
    compress(data: Buffer): Buffer;
    decompress(data: Buffer): Buffer;
}
export declare class GzipCompression implements Compression {
    static create(): GzipCompression;
    getType(): CompressionType;
    compress(data: Buffer): Buffer;
    decompress(data: Buffer): Buffer;
}
