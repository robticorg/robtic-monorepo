export type AccessType = "user" | "admin" | "support" | "claimedUser" | "everyone";

export type TicketStatus = "OPEN" | "CLOSED" | "OPENING" | "CLOSING" | "SAVED" | "FAILED_CLOSE" | "FAILED_OPEN";

export type ticketBy = "channel" | "user";

type Permission<T = bigint> = {
    allow?: T[];
    deny?: T[];
};

export type StatusPermissionMap = Record<TicketStatus!, Record<AccessType!, Permission!>>;

export interface PermissionProps {
    statusPermissions?: StatusPermissionMap;
}