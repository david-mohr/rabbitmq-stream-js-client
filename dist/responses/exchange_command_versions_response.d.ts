import { Version } from "../versions";
import { AbstractResponse } from "./abstract_response";
import { RawResponse } from "./raw_response";
export declare class ExchangeCommandVersionsResponse extends AbstractResponse {
    static key: number;
    static readonly Version = 1;
    readonly serverDeclaredVersions: Version[];
    constructor(response: RawResponse);
}
