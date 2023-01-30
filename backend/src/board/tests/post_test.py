import json

from unittest.mock import patch

from django.test import TestCase

from board.models import User, Post, PostContent, PostConfig, Profile


class PostTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(
            username='test',
            password='test',
            email='test@test.com',
            first_name='Test User',
        )

        Profile.objects.create(
            user=User.objects.get(username='test'),
        )

        number_of_posts = 100

        for post_num in range(number_of_posts):
            Post.objects.create(
                url=f'test-post-{post_num}',
                title=f'Test Post {post_num}',
                author=User.objects.get(username='test'),
            )

            PostContent.objects.create(
                posts=Post.objects.get(url=f'test-post-{post_num}'),
                text_md=f'# Test Post {post_num}',
                text_html=f'<h1Test >Post {post_num}</h1>'
            )

            PostConfig.objects.create(
                posts=Post.objects.get(url=f'test-post-{post_num}'),
                hide=False,
                advertise=False,
            )

    def test_get_popular_posts_list(self):
        response = self.client.get('/v1/posts/popular')
        self.assertEqual(response.status_code, 200)

    def test_popular_posts_list_pagination(self):
        response = self.client.get('/v1/posts/popular')
        self.assertEqual(len(json.loads(response.content)['body']['posts']), 24)

    def test_raise_not_found_when_over_last_page(self):
        response = self.client.get('/v1/posts/popular?page=9999')
        self.assertEqual(response.status_code, 404)

    def test_get_newest_posts_list(self):
        response = self.client.get('/v1/posts/newest')
        self.assertEqual(response.status_code, 200)

    def test_get_newest_posts_list_pagination(self):
        response = self.client.get('/v1/posts/newest')
        self.assertEqual(len(json.loads(response.content)['body']['posts']), 24)

    def test_no_access_liked_posts_to_not_logged_in_user(self):
        response = self.client.get('/v1/posts/liked')
        self.assertEqual(response.status_code, 404)

    def test_get_liked_posts_list(self):
        self.client.login(username='test', password='test')

        response = self.client.get('/v1/posts/liked')
        self.assertEqual(response.status_code, 200)

    def test_get_feature_posts_list(self):
        params = {'username': '@test'}
        response = self.client.get('/v1/posts/feature', params)
        self.assertEqual(response.status_code, 200)

    def test_get_user_post_list(self):
        response = self.client.get('/v1/users/@test/posts')
        self.assertEqual(response.status_code, 200)

    def test_get_user_post_list_pagination(self):
        response = self.client.get('/v1/users/@test/posts')
        content = json.loads(response.content)
        self.assertEqual(len(content['body']['posts']), 10)

    def test_get_user_post_detail(self):
        params = {'mode': 'view'}
        response = self.client.get('/v1/users/@test/posts/test-post-0', params)
        self.assertEqual(response.status_code, 200)

    def test_no_access_other_user_post_edit_mode(self):
        params = {'mode': 'edit'}
        response = self.client.get('/v1/users/@test/posts/test-post-0', params)
        self.assertEqual(response.status_code, 404)

    def test_get_user_post_detail_edit_mode(self):
        self.client.login(username='test', password='test')

        response = self.client.get('/v1/users/@test/posts/test-post-0', {
            'mode': 'edit'
        })
        self.assertEqual(response.status_code, 200)

    @patch('modules.markdown.parse_to_html', return_value='<h1>Mocked Text</h1>')
    def test_update_user_post(self, mock_service):
        post = Post.objects.get(url='test-post-0')
        self.client.login(username='test', password='test')

        response = self.client.post('/v1/users/@test/posts/test-post-0', {
            'title': f'{post.title} Updated',
            'text_md': post.content.text_md,
            'hide': post.config.hide,
            'advertise': post.config.advertise,
        })
        self.assertEqual(response.status_code, 200)

        post.refresh_from_db()
        self.assertEqual(post.title, 'Test Post 0 Updated')

    def test_get_user_post_detail_edit_mode_with_not_exist_post(self):
        self.client.login(username='test', password='test')

        params = {'mode': 'edit'}
        response = self.client.get('/v1/users/@test/posts/not-exist-post', params)
        self.assertEqual(response.status_code, 404)

    def test_get_user_post_detail_edit_mode_with_not_exist_user(self):
        self.client.login(username='test', password='test')

        params = {'mode': 'edit'}
        response = self.client.get('/v1/users/@not-exist-user/posts/test-post-0', params)
        self.assertEqual(response.status_code, 404)

    def test_get_user_post_detail_edit_mode_with_not_match_user(self):
        self.client.login(username='test', password='test')

        params = {'mode': 'edit'}
        response = self.client.get('/v1/users/@not-test-user/posts/test-post-0', params)
        self.assertEqual(response.status_code, 404)

    @patch('modules.markdown.parse_to_html', return_value='<h1>Mocked Text</h1>')
    def test_create_post(self, mock_service):
        self.client.login(username='test', password='test')

        response = self.client.post('/v1/posts', {
            'title': 'Test Post',
            'text_md': '# Test Post',
            'is_hide': False,
            'is_advertise': False,
        })
        self.assertEqual(response.status_code, 200)
        content = json.loads(response.content)
        self.assertEqual(content['body']['url'], 'test-post')

    @patch('modules.markdown.parse_to_html', return_value='<h1>Mocked Text</h1>')
    def test_create_post_duplicate_url(self, mock_service):
        self.client.login(username='test', password='test')

        response = self.client.post('/v1/posts', {
            'title': 'Test Post 1',
            'text_md': '# Test Post 1',
            'is_hide': False,
            'is_advertise': False,
        })
        self.assertEqual(response.status_code, 200)
        content = json.loads(response.content)
        self.assertEqual(len(content['body']['url']), len('test-post-1-00000000'))