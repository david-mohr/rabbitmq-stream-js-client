import { Logger } from "./logger";
import { Request } from "./requests/request";
export interface HeartbeatConnection {
    send(cmd: Request): Promise<void>;
    close(): Promise<void>;
}
export declare class Heartbeat {
    private readonly connection;
    private readonly logger;
    private MAX_HEARTBEATS_MISSED;
    private interval;
    private lastMessageReceived;
    private lastMessageSent;
    private idleCounter;
    private timeout;
    private heartBeatStarted;
    constructor(connection: HeartbeatConnection, logger: Logger);
    start(secondsInterval: number): void;
    stop(): void;
    get started(): boolean;
    reportLastMessageReceived(): void;
    reportLastMessageSent(): void;
    private heartbeat;
    private sendHeartbeat;
    private idleDetection;
}
