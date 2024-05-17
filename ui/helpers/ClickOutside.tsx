import React, {type FunctionComponent, useEffect} from "react";

interface Props {
    onClick: (event: Event) => void;
    children?: any;
    state?: boolean;
    throttle?: number;
}

const ClickOutside: FunctionComponent<Props> = (props) => {
    function onSelfClick(e: React.MouseEvent) {
        e.stopPropagation();
    }

    function addEvent() {
        setTimeout(() => {
            document.addEventListener('click', onClick);
        }, props.throttle);
    }
    function removeEvent() {
        document.removeEventListener('click', onClick);
    }
    function onClick(event: Event) {
        props.onClick(event)
    }

    useEffect(() => {
        if (props.state) addEvent();
        else removeEvent();

        return () => {
            removeEvent();
        }
    }, [props.state]);

    return React.cloneElement(props.children, {
        onClick: onSelfClick
    });
};
ClickOutside.defaultProps = {
    state: true,
    throttle: 0
};

export default ClickOutside;
