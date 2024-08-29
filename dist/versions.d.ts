import { Logger } from "./logger";
export type Version = {
    key: number;
    minVersion: number;
    maxVersion: number;
};
export declare function getClientSupportedVersions(serverVersion?: string): Version[];
export declare function checkServerDeclaredVersions(serverDeclaredVersions: Version[], logger: Logger, serverVersion?: string): boolean;
