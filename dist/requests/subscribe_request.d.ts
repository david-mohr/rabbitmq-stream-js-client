import { AbstractRequest } from "./abstract_request";
import { DataWriter } from "./data_writer";
declare const OFFSET_TYPE: {
    readonly first: 1;
    readonly last: 2;
    readonly next: 3;
    readonly numeric: 4;
    readonly timestamp: 5;
};
export type OffsetType = keyof typeof OFFSET_TYPE;
export declare class Offset {
    readonly type: OffsetType;
    readonly value?: bigint | undefined;
    private constructor();
    write(writer: DataWriter): void;
    static first(): Offset;
    static last(): Offset;
    static next(): Offset;
    static offset(offset: bigint): Offset;
    static timestamp(date: Date): Offset;
    clone(): Offset;
}
export declare class SubscribeRequest extends AbstractRequest {
    private params;
    static readonly Key = 7;
    static readonly Version = 1;
    readonly key = 7;
    readonly responseKey: number;
    private readonly _properties;
    constructor(params: {
        subscriptionId: number;
        stream: string;
        credit: number;
        offset: Offset;
        properties?: Record<string, string>;
    });
    protected writeContent(writer: DataWriter): void;
}
export {};
