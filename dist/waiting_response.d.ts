import { PromiseResolver } from "./promise_resolver";
import { Response } from "./responses/response";
export declare class WaitingResponse<T extends Response> {
    private correlationId;
    private key;
    private promise;
    constructor(correlationId: number, key: number, promise: PromiseResolver<T>);
    waitingFor(response: Response): boolean;
    resolve(response: T): void;
}
