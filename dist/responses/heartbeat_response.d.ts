import { RawTuneResponse } from "./raw_response";
import { Response } from "./response";
export declare class HeartbeatResponse implements Response {
    private response;
    static key: number;
    static readonly Version = 1;
    constructor(response: RawTuneResponse);
    get key(): 20;
    get correlationId(): number;
    get code(): number;
    get ok(): boolean;
}
