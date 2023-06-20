import Router from 'next/router';
import { useState } from 'react';

import { EditorLayout } from '@system-design/article-editor-page';

import * as API from '~/modules/api';
import { snackBar } from '~/modules/ui/snack-bar';

import { GetServerSideProps } from 'next';

interface Props extends API.GetAnUserPostsEditResponseData {
    posturl: string;
    username: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, query }) => {
    const { author = '', posturl = '' } = query as {
        [key: string]: string;
    };

    if (!author.startsWith('@') || !posturl) {
        return { notFound: true };
    }

    const { cookie } = req.headers;

    try {
        const { data } = await API.getAnUserPostsEdit(
            author,
            posturl,
            cookie
        );
        return {
            props: {
                posturl: posturl,
                username: author,
                ...data.body
            }
        };
    } catch (error) {
        return { notFound: true };
    }
};

let imageFile: File | undefined;

export default function Edit(props: Props) {
    const [title, setTitle] = useState(props.title);
    const [content, setContent] = useState(props.textMd);
    const [series, setSeries] = useState(props.series);
    const [description, setDescription] = useState(props.description);
    const [tags, setTags] = useState(props.tags.join(','));
    const [isHide, setIsHide] = useState(props.isHide);
    const [isAdvertise, setIsAdvertise] = useState(props.isAdvertise);

    const onSubmit = async (onFail: () => void) => {
        if (!title) {
            snackBar('😅 제목이 비어있습니다.');
            onFail();
            return;
        }
        if (!tags) {
            snackBar('😅 키워드를 작성해주세요.');
            onFail();
            return;
        }
        try {
            const { data } = await API.postAnUserPosts(props.username, props.posturl, {
                title: title,
                text_md: content,
                image: imageFile,
                description: description,
                tag: tags,
                series,
                is_hide: JSON.stringify(isHide),
                is_advertise: JSON.stringify(isAdvertise)
            });
            if (data.status === 'DONE') {
                Router.push('/[author]/[posturl]', `/${props.username}/${props.posturl}`);
            }
        } catch (e) {
            snackBar('😥 글 수정중 오류가 발생했습니다.');
            onFail();
        }
    };

    return (
        <EditorLayout
            title={{
                value: title,
                onChange: setTitle
            }}
            content={{
                value: content,
                onChange: setContent
            }}
            tags={{
                value: tags,
                onChange: setTags
            }}
            description={{
                value: description,
                onChange: setDescription
            }}
            series={{
                value: series,
                onChange: setSeries
            }}
            isHide={{
                value: isHide,
                onChange: setIsHide
            }}
            isAd={{
                value: isAdvertise,
                onChange: setIsAdvertise
            }}
            image={{
                onChange: (image) => {
                    imageFile = image;
                }
            }}
            publish={{
                title: '포스트 수정',
                buttonText: '이렇게 수정하겠습니다'
            }}
            onSubmit={onSubmit}
        />
    );
}
