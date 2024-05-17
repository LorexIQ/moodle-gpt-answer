import styleText from 'data-text:./index.module.scss';
import * as style from './index.module.scss';
import MyInput from "~ui/input/MyInput";
import MyButton from "~ui/button/MyButton";
import MySelect from "~ui/select/MySelect";
import useStatus from "~hooks/useStatus";

export const getStyle = () => {
    const style = document.createElement('style');
    style.textContent = styleText;
    return style;
};

function IndexOptions() {
    const {
        models,
        settings,
        setSetting,
        getGPTStatus,
        getStatusName
    } = useStatus();

    return (
        <div className={style.settings}>
            <h1>Настройки</h1>

            <div className={style.settings__content}>
                <MyInput
                    title='Token'
                    placeholder='Введите токен'
                    value={settings.token}
                    onChange={token => setSetting({ token })}
                />
                <MyInput
                    title='OpenAI Origin'
                    placeholder='Введите адрес сервера'
                    value={settings.origin}
                    onChange={origin => setSetting({ origin })}
                />
                <MySelect
                    title='Модель'
                    placeholder='Выберите модель'
                    value={settings.model}
                    values={models}
                    onChange={model => setSetting({ model })}
                />
                <hr/>

                <div className={style.settings__content__status}>
                    <span>Статус</span>
                    <div className={style.settings__content__status__content}>
                        <div
                            className={`
                                ${style.settings__content__status__content__status}
                                ${style[`settings__content__status__content__status__${settings.status}`]}
                            `}
                        >
                            {getStatusName(settings.status)}
                        </div>
                        <MyButton
                            onClick={getGPTStatus}
                            disabled={settings.status === 'unknown'}
                        >
                            Проверить
                        </MyButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IndexOptions;
