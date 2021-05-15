import React from 'react';
import Head from 'next/head';

import { Pagination } from '@components/common';
import Profile from '@components/profile/Profile';
import PostsComponent from '@components/profile/Posts';

import * as API from '@modules/api';

import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const {
        author = '',
        page = 1,
    } = context.query;

    if(!author.includes('@')) {
        return {
            notFound: true
        };
    }

    try {
        const { data } = await API.getUserProfile(author as string, [
            'profile',
            'social',
            'tags'
        ]);
        
        const posts = await API.getUserPosts(
            author as string, 
            Number(page)
        );
        return {
            props: {
                page,
                ...data.body,
                ...posts.data.body
            }
        }
    } catch(error) {
        return {
            notFound: true
        };
    }
}

interface Props extends API.GetUserProfileData, API.GetUserPostsData {
    page: number;
}

export default function UserPosts(props: Props) {
    return (
        <>
            <Head>
                <title>{props.profile.username} ({props.profile.realname}) —  Posts</title>
            </Head>

            <Profile
                active="posts"
                profile={props.profile}
                social={props.social!}
            />
            <div className="container">
                <PostsComponent
                    allCount={props.allCount}
                    active="all"
                    author={props.profile.username}
                    tags={props.tags!}
                    posts={props.posts}>
                    <Pagination
                        page={props.page}
                        last={props.lastPage}
                    />
                </PostsComponent>
            </div>
        </>
    )
}