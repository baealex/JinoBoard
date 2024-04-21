import React, { useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useStore } from 'badland-react';

import { authorRenameCheck } from '~/modules/middleware/author';

import {
    Button,
    Card,
    Container,
    Flex,
    Loading,
    Modal,
    Text
} from '@design-system';
import { SEO } from '@system-design/shared';
import { SeriesArticleCard } from '@system-design/series';

import { snackBar } from '~/modules/ui/snack-bar';

import { getUserImage } from '~/modules/utility/image';

import * as API from '~/modules/api';

import { authStore } from '~/stores/auth';
import { configStore } from '~/stores/config';

import { useForm } from '~/hooks/use-form';
import { useInfinityScroll } from '~/hooks/use-infinity-scroll';

interface Props {
    order: 'latest' | 'past';
    series: API.GetAnUserSeriesResponseData;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { cookies } = context.req;
    configStore.serverSideInject(cookies);

    const {
        order = 'latest',
        author = '',
        seriesurl = ''
    } = context.query as {
        [key: string]: string;
    };

    if (!author.startsWith('@')) {
        return { notFound: true };
    }

    try {
        const { data } = await API.getAnUserSeries(author, seriesurl, {
            page: 1,
            order: order as Props['order']
        });
        return {
            props: {
                order: order,
                series: data.body
            }
        };
    } catch (error) {
        return await authorRenameCheck(error, {
            author,
            continuePath: `/series/${encodeURI(seriesurl)}`
        });
    }
};

interface Form {
    title: string;
    description: string;
}

export default function Series(props: Props) {
    const router = useRouter();

    const [{ username }] = useStore(authStore);

    const [isOpenSeriesUpdateModal, setIsOpenSeriesUpdateModal] = useState(false);

    const { data: posts, mutate: setPosts, isLoading } = useInfinityScroll({
        key: ['series', props.series.url, props.order],
        callback: async (nextPage) => {
            const { data } = await API.getAnUserSeries(
                '@' + props.series.owner,
                props.series.url,
                {
                    page: nextPage,
                    order: props.order
                }
            );
            return data.body.posts;
        },
        initialValue: props.series.posts,
        lastPage: props.series.lastPage
    });

    const { register, handleSubmit } = useForm<Form>();

    const handleSeriesUpdate = handleSubmit(async (formData) => {
        const { data } = await API.putUserSeries('@' + props.series.owner, props.series.url, formData);

        if (data.status === 'DONE') {
            router.replace(`/@${username}/series/${data.body.url}`);
            setIsOpenSeriesUpdateModal(false);
            snackBar('😀 시리즈가 업데이트 되었습니다.');
        } else {
            snackBar('😯 변경중 오류가 발생했습니다.');
        }
    });

    const handleRemovePosts = async (url: string) => {
        if (confirm('😮 이 포스트를 시리즈에서 제거할까요?')) {
            const { data } = await API.putAnUserPosts('@' + props.series.owner, url, 'series');
            if (data.status === 'DONE') {
                setPosts((prevPosts) => prevPosts.filter(post => post.url !== url));
                snackBar('😀 시리즈가 업데이트 되었습니다.');
            } else {
                snackBar('😯 변경중 오류가 발생했습니다.');
            }
        }
    };

    const SeriesUpdateModal = () => (
        <Modal
            title="시리즈 수정"
            isOpen={isOpenSeriesUpdateModal}
            onClose={() => setIsOpenSeriesUpdateModal(false)}
            submitText="시리즈를 수정합니다"
            onSubmit={handleSeriesUpdate}>
            <div className="input-group mb-3 mr-sm-2 mt-3">
                <div className="input-group-prepend">
                    <div className="input-group-text">시리즈명</div>
                </div>
                <input
                    {...register('title')}
                    type="text"
                    placeholder="시리즈의 이름"
                    className="form-control"
                    maxLength={50}
                    required
                    defaultValue={props.series.name}
                />
            </div>
            <textarea
                {...register('description')}
                cols={40}
                rows={5}
                placeholder="설명을 작성하세요."
                className="form-control"
                defaultValue={props.series.description}
            />
            {posts.map((post, idx) => (
                <Card key={post.url} hasShadow isRounded className="p-3 mt-3">
                    <Flex justify="between">
                        <span className="deep-dark">
                            {idx + 1}. {post.title}
                        </span>
                        <a onClick={() => handleRemovePosts(post.url)}>
                            <i className="fas fa-times"></i>
                        </a>
                    </Flex>
                </Card>
            ))}
        </Modal>
    );

    return (
        <>
            <SEO
                title={`시리즈 - ${props.series.name} | ${props.series.owner}`}
                image={props.series.image}
            />

            {props.series.owner === username && (
                <SeriesUpdateModal />
            )}

            <div className="series-header">
                <Flex align="center" justify="center" style={{ minHeight: '280px' }}>
                    <Container size="sm">
                        <Text tag="h1" fontSize={6} fontWeight={600} className="mt-5 mb-2">“{props.series.name}” 시리즈</Text>
                        <Text>{props.series.description}</Text>
                    </Container>
                </Flex>
                {props.series.owner == username && (
                    <div className="corner">
                        <Button onClick={() => setIsOpenSeriesUpdateModal(true)}>
                            시리즈 수정
                        </Button>
                    </div>
                )}
            </div>

            <div className="user-image-wrapper">
                <Link href={`/@${props.series.owner}`}>
                    <img src={getUserImage(props.series.ownerImage)} alt={props.series.name} />
                </Link>
            </div>

            <Container size="xs-sm">
                <Flex justify="end" className="mb-4">
                    {props.order === 'latest' ? (
                        <Button
                            onClick={() => router.replace(`/@${props.series.owner}/series/${props.series.url}?order=past`, '', {
                                scroll: false
                            })}>
                            최신부터 <i className="fas fa-sort-amount-down"></i>
                        </Button>
                    ) : (
                        <Button
                            onClick={() => router.replace(`/@${props.series.owner}/series/${props.series.url}`, '', {
                                scroll: false
                            })}>
                            과거부터 <i className="fas fa-sort-amount-up"></i>
                        </Button>
                    )}
                </Flex>
                {posts.map((post) => (
                    <SeriesArticleCard
                        key={post.url}
                        author={props.series.owner}
                        {...post}
                    />
                ))}
                {isLoading && (
                    <Flex justify="center" className="pb-4">
                        <Loading position="inline" />
                    </Flex>
                )}
            </Container>

            <style jsx>{`
                :global(main.content) {
                    padding-top: 0;
                    padding-bottom: 50px;
                    background-color: #F2F2F2;

                    :global(body.dark) & {
                        background-color: #151515;
                    }
                }
                
                .series-header {
                    background: #000;
                    position: relative;
                    padding: 64px 0;
                    text-align: center;
                    color: #eee;

                    .corner {
                        position: absolute;
                        bottom: 16px;
                        right: 16px;
                    }
                }

                .series-header::after {
                    content: '';
                    position: absolute;
                    bottom: -28px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-style: solid;
                    border-width: 30px 30px 0 30px;
                    border-color: #000 transparent transparent transparent;
                }

                .user-image-wrapper {
                    width: 200px;
                    height: 200px;
                    border-radius: 100%;
                    overflow: hidden;
                    margin: 60px auto;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;

                        &:hover {
                            transform: scale(1.5);
                        }

                        transition: transform 0.2s ease-in-out;
                    }
                }
            `}</style>
        </>
    );
}
