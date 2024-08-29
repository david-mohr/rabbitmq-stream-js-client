export type CreditRequestWrapper = (howMany: number) => Promise<void>;
export declare abstract class ConsumerCreditPolicy {
    protected readonly startFrom: number;
    constructor(startFrom: number);
    onChunkReceived(_requestWrapper: CreditRequestWrapper): Promise<void>;
    onChunkCompleted(_requestWrapper: CreditRequestWrapper): Promise<void>;
    requestCredits(requestWrapper: CreditRequestWrapper, amount: number): Promise<void>;
    onSubscription(): number;
}
declare class NewCreditsOnChunkReceived extends ConsumerCreditPolicy {
    private readonly step;
    constructor(startFrom?: number, step?: number);
    onChunkReceived(requestWrapper: CreditRequestWrapper): Promise<void>;
    onSubscription(): number;
}
declare class NewCreditsOnChunkCompleted extends ConsumerCreditPolicy {
    private readonly step;
    constructor(startFrom?: number, step?: number);
    onChunkCompleted(requestWrapper: CreditRequestWrapper): Promise<void>;
}
export declare const creditsOnChunkReceived: (startFrom: number, step: number) => NewCreditsOnChunkReceived;
export declare const creditsOnChunkCompleted: (startFrom: number, step: number) => NewCreditsOnChunkCompleted;
export declare const defaultCreditPolicy: NewCreditsOnChunkReceived;
export {};
