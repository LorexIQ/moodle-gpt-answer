import styleText from 'data-text:./index.module.scss';
import * as style from './index.module.scss';
import useStatus from "~hooks/useStatus";
import {IconSettings} from "~ui/icons/Settings";
import {IconRefresh} from "~ui/icons/Refresh";

export const getStyle = () => {
    const style = document.createElement('style');
    style.textContent = styleText;
    return style;
};

function IndexPopup() {
    const {
        settings,
        getGPTStatus,
        getStatusName
    } = useStatus();

    function openSettings() {
        chrome.tabs.create({
            url: "./options.html"
        });
    }

    return (
        <div className={style.popup}>
            <div
                className={`
                                ${style.popup__status}
                                ${style[`popup__status__${settings.status}`]}
                            `}
            >
                {getStatusName(settings.status)}
            </div>
            <hr/>
            <IconRefresh
                className={`${settings.status === 'unknown' ? style.popup__btn__rotate : ''}`}
                onClick={getGPTStatus}
            />
            <hr/>
            <IconSettings onClick={openSettings}/>
        </div>
    )
}

export default IndexPopup
