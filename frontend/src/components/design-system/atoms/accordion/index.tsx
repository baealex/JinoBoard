import classNames from 'classnames/bind';
import styles from './Accordion.module.scss';
const cn = classNames.bind(styles);

import {
    useEffect,
    useRef,
    useState
} from 'react';

export interface AccordionProps {
    minHeight?: number;
    children?: React.ReactNode;
}

export function Accordion({
    minHeight = 130,
    children
}: AccordionProps) {
    const ref = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [maxHeight, setMaxHeight] = useState(0);

    useEffect(() => {
        if (ref.current) {
            setMaxHeight(ref.current.clientHeight + 30);
        }
    }, [ref.current]);

    return (
        <div
            className={cn('Accordion')}
            style={{
                height: isOpen
                    ? `${maxHeight}px`
                    : `${maxHeight < minHeight ? maxHeight : minHeight}px`
            }}
        >
            <div ref={ref}>
                {children}
            </div>
            <button onClick={() => setIsOpen(!isOpen)}>
                <i
                    className={classNames(
                        'fas fa-chevron-up',
                        cn({ isOpen })
                    )}></i>
            </button>
        </div>
    );
}