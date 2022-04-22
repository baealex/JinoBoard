import { PageNavigation } from '@design-system';

const NAVIGATION_ITEMS = [
    {
        link: '/',
        name: '최신 포스트'
    },
    {
        link: '/popular',
        name: '인기 포스트'
    },
    {
        link: '/tags',
        name: '태그 클라우드'
    },
];

export interface CollectionLayoutProps {
    active: '최신 포스트' | '인기 포스트' | '태그 클라우드' | string;
    children: JSX.Element;
    itemExpended?: (tag: typeof NAVIGATION_ITEMS) => typeof NAVIGATION_ITEMS;
}

export function CollectionLayout(props: CollectionLayoutProps) {
    return (
        <div className="container">
            <PageNavigation
                items={props.itemExpended 
                    ? props.itemExpended(NAVIGATION_ITEMS)
                    : NAVIGATION_ITEMS}
                active={props.active}
            />
            {props.children}
        </div>
    )
}