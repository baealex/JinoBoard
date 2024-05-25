import classNames from 'classnames/bind';
import styles from './RecentActivity.module.scss';
const cn = classNames.bind(styles);

import type { ActivityItemProps } from './activity-item';
import { ActivityItem } from './activity-item';

export interface RecentActivityProps {
    items: ActivityItemProps[];
}

export function RecentActivity({ items }: RecentActivityProps) {
    return items.length > 0 && (
        <ul className={`${cn('activity')}`}>
            {items.map((item, idx) => (
                <li key={idx}>
                    <ActivityItem {...item} />
                </li>
            ))}
        </ul>
    );
}
