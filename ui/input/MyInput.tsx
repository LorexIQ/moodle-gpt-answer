import styleText from 'data-text:./MyInput.module.scss';
import * as style from './MyInput.module.scss';

export const getStyle = () => {
    const style = document.createElement('style');
    style.textContent = styleText;
    return style;
};

interface Props {
    title: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}

const MyInput = (props: Props) => {
    return (
        <div className={style.MyInput}>
            <div className={style.MyInput__title}>
                {props.title}
            </div>
            <input
                placeholder={props.placeholder}
                value={props.value}
                onChange={e => props.onChange(e.target.value)}
            />
        </div>
    );
}

export default MyInput;
