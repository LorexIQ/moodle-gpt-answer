import styleText from 'data-text:./MySelect.module.scss';
import * as style from './MySelect.module.scss';
import {useEffect, useState} from "react";
import ClickOutside from "~ui/helpers/ClickOutside";

export const getStyle = () => {
    const style = document.createElement('style');
    style.textContent = styleText;
    return style;
};

interface SelectElType {
    id: number;
    name: string;
}

interface Props {
    title: string;
    values: SelectElType[];
    onChange: (v: SelectElType) => void;
    placeholder: string;
    value?: SelectElType;
}

const MySelect = (props: Props) => {
    const [isOpened, setIsOpened] = useState(false);
    const [innerValue, setInnerValue] = useState(props.value);

    function setValue(v: SelectElType) {
        setIsOpened(false);
        setInnerValue(v);
        props.onChange(v);
    }

    useEffect(() => {
        setInnerValue(props.value);
    }, [props.value])

    return (
        <div className={style.MySelect}>
            <div className={style.MySelect__title}>
                {props.title}
            </div>
            <ClickOutside
                state={isOpened}
                onClick={() => setIsOpened(false)}
            >
                <div className={style.MySelect__select}>
                    <div
                        className={`
                        ${style.MySelect__select__header}
                        ${!innerValue ? style.MySelect__select__header__placeholder : ''}
                        ${isOpened ? style.MySelect__select__header__opened : ''}
                    `}
                        onClick={() => setIsOpened(!isOpened)}
                    >
                        <span>{innerValue?.name ?? props.placeholder}</span>
                    </div>
                    {isOpened && <div className={style.MySelect__select__content}>
                        {props.values.map(v =>
                            <div
                                className={`
                                    ${style.MySelect__select__content__el}
                                    ${innerValue.id === v.id ? style.MySelect__select__content__el__active : ''}
                                `}
                                key={v.id}
                                onClick={() => setValue(v)}
                            >
                                {v.name}
                            </div>
                        )}
                    </div>}
                </div>
            </ClickOutside>
        </div>
    );
}

export default MySelect;
