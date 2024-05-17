import { sendToBackground } from "@plasmohq/messaging";
import type { ChatCompletion, ChatCompletionMessage } from "openai/resources";
import type {PlasmoCSConfig} from "plasmo";
import mainStyles from "url:~/assets/main.scss";

export const config: PlasmoCSConfig = {};


type OpenAIResponseType = 'message' | 'full';


class AnswerCard {
    constructor(
        private readonly symbol: string,
        private readonly text: string,
        private readonly target: HTMLInputElement
    ) {
        this.symbol = symbol.trim().replaceAll('\n', ' ');
        this.text = text.trim().replaceAll('\n', ' ');
    }

    getText() {
        return this.text;
    }
    click() {
        this.target.click();
    }
    clickOff() {
        if (this.target.checked)
            this.target.click();
    }
}
class QuestionCard {
    private oldTitle: string;
    private answers: AnswerCard[] = [];
    private radioPromptPart = 'You can only write numbers. Answer with the serial number of the answer from 1 to number of answers';
    private checkboxPromptPart = 'You can only write numbers. Answer with serial numbers of answers from 1 to number of answers, separated by ";"';
    private prompt = 'YOUR ROLE: YOU CAN\'T WRITE ANY SYMBOLS EXCEPT "1-9" and ";". Question: "{question}". Answers: ["{answers}"]. {promptPart}'

    constructor(
        private readonly text: string,
        private readonly type: 'checkbox' | 'radio'
    ) {
        this.text = text.trim().replaceAll('\n', ' ');
    }

    isQuestion() {
        return !!this.answers.length;
    }

    addAnswer(symbol: string, text: string, target: HTMLInputElement) {
        this.answers.push(new AnswerCard(symbol, text, target));
    }

    getPreparedPrompt() {
        return this.prompt
            .replace('{promptPart}', this.type === 'checkbox' ? this.checkboxPromptPart : this.radioPromptPart)
            .replace('{question}', this.text)
            .replace('{answers}', this.answers.map(a => a.getText()).join('", "'));
    }

    async getAnswer(withLock = true) {
        let response: ChatCompletionMessage;
        if (withLock && document.title === 'Загрузка...') return [-1] as const;

        withLock && this.startLoad();
        try {
            response = await this.sendAIContent(this.getPreparedPrompt());
            console.log(this.getPreparedPrompt())
        } catch (_) {}
        withLock && this.endLoad();

        return response.content
            .split(';')
            .map(content => {
                const answerIndex = Number.parseInt(content);
                return isNaN(answerIndex) ? -1 : this.answers[answerIndex - 1];
            });
    }
    async getAndFillAnswer(withLock = true) {
        this.clearSelects();
        const answers = await this.getAnswer(withLock);
        answers.forEach((answer: AnswerCard | -1) => answer !== -1 && answer.click());
    }

    private clearSelects() {
        if (this.type === 'checkbox')
            this.answers.forEach(answer => answer.clickOff());
    }
    private startLoad() {
        this.oldTitle = document.title;
        document.title = 'Загрузка...';
    }
    private endLoad() {
        document.title = this.oldTitle;
    }
    private async sendAIContent<R extends OpenAIResponseType = 'message'>(content: string, responseType?: R) {
        const { message } = await sendToBackground({
            name: 'gpt',
            body: { content }
        });

        if (!message) throw new Error('AI спит');

        return (responseType === 'full' ? message : message.choices[0].message) as Promise<R extends 'full' ? ChatCompletion : ChatCompletionMessage>;
    }
}


class App {
    private askIcon: string = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M5.486 0c-1.92 0-2.881 0-3.615.373A3.43 3.43 0 0 0 .373 1.871C-.001 2.605 0 3.566 0 5.486v9.6c0 1.92 0 2.88.373 3.613c.329.645.853 1.17 1.498 1.498c.734.374 1.695.375 3.615.375h11.657V24l.793-.396c2.201-1.101 3.3-1.652 4.105-2.473a6.85 6.85 0 0 0 1.584-2.56C24 17.483 24 16.251 24 13.79V5.486c0-1.92 0-2.881-.373-3.615A3.43 3.43 0 0 0 22.129.373C21.395-.001 20.434 0 18.514 0zm1.371 10.285h10.286a5.142 5.142 0 0 1-10.286.024z"/></svg>';
    private match: RegExp = new RegExp('https?:\/\/moodle.*');
    private isOnline = this.match.test(origin);
    private questions: QuestionCard[] = [];

    constructor() {
        if (this.isOnline) console.log('PMA: Script integrated!');
    }

    private connectStyles() {
        const main = document.createElement('link');
        main.rel = 'stylesheet';
        main.href = mainStyles;

        document.head.appendChild(main);
    }
    private addAnswerButton() {
        const header = document.querySelector<HTMLDivElement>('.page-context-header');
        const questions = [...document.querySelectorAll('[id|=question]')]
            .map(element => element.querySelector('.formulation'))
            .filter(element => !!element.querySelector('.answer input:not([disabled="disabled"])')) as HTMLDivElement[];

        questions.length && this.createAnswerAllButton(header);
        questions.forEach(element => {
            element.style.position = 'relative';
            element.appendChild(this.createAnswerButton(element));
        });
    }
    private findDOMElement<T extends HTMLElement>(selector: string, text?: string) {
        const xpath = `//${selector}${text ? `[text()='${text}']` : ''}`;
        let results: T[] = [];
        let query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0, length = query.snapshotLength; i < length; ++i) {
            results.push(query.snapshotItem(i) as T);
        }
        return results;
    }
    private createAnswerButton(content: HTMLElement) {
        const button = document.createElement('div');
        button.classList.add('pma-btn');
        button.style.display = 'none';
        button.innerHTML = this.askIcon;

        const isMoreAnswers = !!content.querySelector('input[type="checkbox"]');
        const questionCard = new QuestionCard([...content.querySelectorAll('.qtext > p')].map(c => c.textContent.trim()).join(' '), isMoreAnswers ? 'checkbox' : 'radio');
        const answers = [...content.querySelectorAll('.answer > div')];

        answers.forEach(answer => questionCard.addAnswer(
            answer.querySelector('.answernumber').textContent.trim(),
            [...answer.querySelectorAll('.flex-fill > p')].map(c => c.textContent.trim()).join(' '),
            [...answer.querySelectorAll('input')].at(-1)
        ));
        button.addEventListener('click', async () => {
            await questionCard.getAndFillAnswer();
        });

        questionCard.isQuestion() && this.questions.push(questionCard);

        return button;
    }
    private createAnswerAllButton(content: HTMLElement) {
        const button = document.createElement('div');
        button.classList.add('pma-btn', 'pma-btn--head');
        button.style.display = 'none';
        button.innerHTML = this.askIcon;

        button.addEventListener('click', async () => {
            if (document.title !== 'Загрузка...') {
                const oldTitle = document.title;
                document.title = 'Загрузка...';

                for (const question of this.questions) {
                    try {
                        await question.getAndFillAnswer(false);
                    } catch(_) {}
                }

                document.title = oldTitle;
            }
        });

        content.style.gap = '10px'
        content.appendChild(button);
    }
    private fixButton(text: string, btnClass: string) {
        const buttons = this.findDOMElement<HTMLButtonElement>('button', text);

        buttons.forEach(button => {
            const form = button.parentElement as HTMLFormElement;
            const formInputs = form.querySelectorAll('input');

            const buttonForReplace = document.createElement('button');
            buttonForReplace.textContent = button.textContent;
            buttonForReplace.classList.add('btn', btnClass);

            buttonForReplace.addEventListener('click', e => {
                e.preventDefault();
                const a = document.createElement('a');
                a.href = `${form.action}?${[...formInputs].map(input => `${input.name}=${input.value}`).join('&')}`;
                a.target = '_blank';
                a.click();
            });

            button.replaceWith(buttonForReplace);
        });
    }

    async init() {
        if (this.isOnline) {
            this.connectStyles();
            this.addAnswerButton();

            this.fixButton('Просмотр', 'pma-def-btn-secondary');
            this.fixButton('Начать попытку', 'pma-def-btn-primary');
            this.fixButton('Пройти тест заново', 'pma-def-btn-primary');
            this.fixButton('Продолжить текущую попытку', 'pma-def-btn-primary');
        }
    }
}

const app = new App();
app.init().then();
