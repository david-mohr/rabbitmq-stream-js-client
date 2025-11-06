import { MessageApplicationProperties } from "../publisher";
import { DataReader } from "../responses/raw_response";
export declare class ApplicationProperties {
    static parse(dataReader: DataReader, elementsLength: number): MessageApplicationProperties;
}
