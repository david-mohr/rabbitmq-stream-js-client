import { DataWriter } from "./data_writer";
import { BufferSizeParams, Request } from "./request";
export declare class BufferDataWriter implements DataWriter {
    private buffer;
    private _offset;
    private readonly maxBufferSize;
    private readonly growthTriggerRatio;
    private readonly sizeMultiplier;
    constructor(buffer: Buffer, startFrom: number, bufferSizeParameters?: BufferSizeParams);
    get offset(): number;
    writePrefixSize(): void;
    writeData(data: string | Buffer): void;
    writeByte(data: number): void;
    writeInt8(data: number): void;
    writeInt16(data: number): void;
    writeUInt8(data: number): void;
    writeUInt16(data: number): void;
    writeUInt32(data: number): void;
    writeInt32(data: number): void;
    writeUInt64(data: bigint): void;
    writeInt64(data: bigint): void;
    writeString(data: string): void;
    toBuffer(): Buffer;
    private growIfNeeded;
    private growBuffer;
    private getNewSize;
}
export declare abstract class AbstractRequest implements Request {
    abstract get key(): number;
    abstract get responseKey(): number;
    get version(): number;
    toBuffer(bufferSizeParams?: BufferSizeParams, correlationId?: number): Buffer;
    protected abstract writeContent(writer: DataWriter): void;
}
