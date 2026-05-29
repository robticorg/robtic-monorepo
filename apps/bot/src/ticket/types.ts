import { LogsChannelProps } from "@robo/shared";

interface TicketChannelConfig {
    name: string;
    category: string | null;
    supportRoleIds?: string[];
    logChannels?: LogsChannelProps;
}

export { 
    TicketChannelConfig 
}