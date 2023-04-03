import type { GetServerSideProps } from 'next';

import { CollectionLayout } from '@system-design/article';
import type { PageComponent } from '~/components';
import { SEO } from '@system-design/shared';

import * as API from '~/modules/api';

export const getServerSideProps: GetServerSideProps = async () => {
    try {
        const { data } = await API.getNewestPosts(1);

        return {
            props: {
                ...data.body
            }
        };
    } catch (error) {
        return { notFound: true };
    }
};

interface Props extends API.GetPostsResponseData {
    trendy?: API.GetPostsResponseData;
    page: number;
}

const TrendyArticles: PageComponent<Props> = () => {
    return (
        <>
            <SEO
                title="최신 포스트 | BLEX"
                description="최신 정보를 모아 볼 수 있는 페이지입니다. 다양한 분야의 최신 포스트를 제공됩니다. 다양한 의견과 정보를 만나보세요."
            />
        </>
    );
};

TrendyArticles.pageLayout = (page, props) => (
    <CollectionLayout active="최신 포스트" {...props}>
        {page}
    </CollectionLayout>
);

export default TrendyArticles;
