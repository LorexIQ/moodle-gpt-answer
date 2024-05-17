import "@plasmohq/messaging/background";
import { startHub } from "@plasmohq/messaging/pub-sub";

export type ModelType = {
    id: number;
    name: string;
};
export type ConnectType = 'close' | 'ready' | 'unknown';
export type SettingsType = {
    status: ConnectType;
    token: string;
    origin: string;
    model: ModelType;
};

startHub();
