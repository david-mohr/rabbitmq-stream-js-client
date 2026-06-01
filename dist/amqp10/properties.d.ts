import { MessageProperties } from "../publisher";
import { DataReader } from "../responses/raw_response";
export declare class Properties {
    static parse(dataResponse: DataReader, fields: number): MessageProperties;
}
