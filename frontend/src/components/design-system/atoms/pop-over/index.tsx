import styles from './PopOver.module.scss';
import classNames from 'classnames/bind';
const cn = classNames.bind(styles);

import { useState } from 'react';

export interface PopOverProps {
    text: string;
    children: JSX.Element;
}

export function PopOver(props: PopOverProps) {
    const [ hover, setHover ] = useState(false);

    return (
        <>
            <div>
                <div className={cn('popover', { hover })}>
                    {props.text}
                </div>
                <div
                    onMouseOver={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    {props.children}
                </div>
            </div>
        </>
    )
}