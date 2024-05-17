import styleText from 'data-text:./MyButton.module.scss';
import * as style from './MyButton.module.scss';

export const getStyle = () => {
    const style = document.createElement('style');
    style.textContent = styleText;
    return style;
};

interface Props {
    children: any;
    disabled?: boolean;
    onClick?: () => void;
}

const MyButton = (props: Props) => {
    return (
        <button
            className={style.MyButton}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

export default MyButton;
