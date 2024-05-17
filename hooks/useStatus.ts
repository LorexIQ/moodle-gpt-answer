import {Storage} from "@plasmohq/storage";
import {useEffect, useState} from "react";
import type {ConnectType, ModelType, SettingsType} from "~background";
import {sendToBackground} from "@plasmohq/messaging";

const useStatus = () => {
    const models: ModelType[] = [
        'gpt-4-turbo',
        'gpt-4-turbo-2024-04-09',
        'gpt-4-0125-preview',
        'gpt-4-turbo-preview',
        'gpt-4-1106-preview', // BEST
        'gpt-4-vision-preview',
        'gpt-4',
        'gpt-4-0314',
        'gpt-4-0613',
        'gpt-4-32k',
        'gpt-4-32k-0314',
        'gpt-4-32k-0613',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'gpt-3.5-turbo-0301',
        'gpt-3.5-turbo-0613',
        'gpt-3.5-turbo-1106',
        'gpt-3.5-turbo-0125',
        'gpt-3.5-turbo-16k-0613'
    ].map((name, id) => ({ id, name }));
    const storage = new Storage({
        area: 'local',
        copiedKeyList: ['modulation']
    });
    const [settings, setSettings] = useState<SettingsType>({
        status: 'close',
        token: '',
        origin: 'https://api.proxyapi.ru/openai/v1',
        model: models[4]
    });

    function setStatus(status: ConnectType, delay = 0) {
        setTimeout(() => setSettings({ ...settings, status }), delay);
    }
    function setSetting(_settings: { [name in keyof SettingsType]?: SettingsType[name] }) {
        setSettings({ ...settings, status: 'close', ..._settings });
    }
    function getStatusName(status: ConnectType) {
        switch (status) {
            case "unknown":
                return 'Проверка...';
            case "close":
                return 'Нет подключения';
            case "ready":
                return 'Подключено';
        }
    }
    function getGPTStatus() {
        setStatus('unknown');

        sendToBackground({
            name: 'gptStatus',
        })
            .then(r => {
                if (r.status) setStatus('ready', 300);
                else setStatus('close', 300);
            })
            .catch(() => setStatus('close', 300));
    }

    useEffect(() => {
        storage.get<SettingsType>('pma-settings')
            .then(r => {
                if (r) {
                    setSettings(r);
                }
            })
    }, []);
    useEffect(() => {
        storage.set('pma-settings', settings);
    }, [settings]);

    return {
        models,
        settings,
        setSetting,
        getGPTStatus,
        getStatusName
    };
};

export default useStatus;
