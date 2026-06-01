import { DataReader } from "../responses/raw_response";
import { MessageHeader } from "../publisher";
export declare class Header {
    static parse(dataResponse: DataReader, fields: number): MessageHeader;
}
