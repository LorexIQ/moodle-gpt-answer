import type { PlasmoMessaging } from "@plasmohq/messaging"
import {OpenAI} from 'openai';
import type {SettingsType} from "~background";
import {Storage} from "@plasmohq/storage";


function sendChatContent(settings: SettingsType, content: string) {
    const openai = new OpenAI({
        apiKey: settings.token,
        baseURL: settings.origin
    });

    return openai.chat.completions.create({
        temperature: 0,
        messages: [{ role: 'user', content }],
        model: 'gpt-4-1106-preview'
    })
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage({ area: 'local' });
    const settings = await storage.get<SettingsType>('pma-settings');
    const body = req.body;

    if (!body.content) throw new Error('Отсутствует "content"');
    if (!settings) throw new Error('Нет подключения к боту. Проверьте настройки расширения');

    res.send({
        message: await sendChatContent(settings, body.content)
    });
};

export default handler;
