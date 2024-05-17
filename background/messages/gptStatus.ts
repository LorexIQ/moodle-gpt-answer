import type { PlasmoMessaging } from "@plasmohq/messaging"
import {OpenAI} from 'openai';
import {Storage} from "@plasmohq/storage";
import type {SettingsType} from "~background";


async function getGPTStatus(settings: SettingsType) {
    const openai = new OpenAI({
        apiKey: settings.token,
        baseURL: settings.origin
    })

    return openai.chat.completions.create({
        temperature: 0,
        messages: [{role: 'user', content: 'answer yes or no'}],
        model: settings.model.name
    })
        .then(r => r.choices[0]?.message?.content && true)
        .catch(() => false);
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage({ area: 'local' });
    const settings = await storage.get<SettingsType>('pma-settings');

    res.send({
        status: !!(settings && await getGPTStatus(settings))
    });
};

export default handler;
