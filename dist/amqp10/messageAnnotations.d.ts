import { MessageAnnotations } from "../publisher";
import { DataReader } from "../responses/raw_response";
export declare class Annotations {
    static parse(dataReader: DataReader, elementsLength: number): MessageAnnotations;
}
