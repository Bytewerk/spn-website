from django.test import TestCase, Client
from django.contrib.auth.models import User
from core.models import SnakeVersion, ActiveSnake

class RestTestCase(TestCase):
    
    def setUp(self):
        self.user = 'lion'
        self.client.force_login(User.objects.get_or_create(username=self.user)[0])

    def test_list_snakes(self):
        """List all snaken through the REST API"""
        response = self.client.post('/snake/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'No snakes defined yet.')

    def test_new_snake_editor(self):
        """Open new snake editor"""
        response = self.client.post('/snake/create')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<textarea id="code" name="code"></textarea>')
    
    def test_create_snake(self):
        """Create new snake"""
        self.client.post('/snake/create', {'code': 'test code'})
        self.assertEqual(len(SnakeVersion.objects.all()), 1)
        self.client.post('/snake/create', {'code': 'test code'})
        self.assertEqual(len(SnakeVersion.objects.all()), 2)
    
    def test_activate_snake(self):
        """Activate a snake"""
        self.client.post('/snake/create', {'code': 'test code'})
        self.assertEqual(len(ActiveSnake.objects.all()), 0)

        response = self.client.post('/snake/activate/{}'.format(1), HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.json()['message'], 'Snake 1 was activated')
        self.assertEqual(len(ActiveSnake.objects.all()), 1)

    def test_delete_snake(self):
        """Delete a snake"""
        self.client.post('/snake/create', {'code': 'test code'})
        self.assertEqual(len(SnakeVersion.objects.all()), 1)

        self.client.post('/snake/delete/{}'.format(1))
        self.assertEqual(len(SnakeVersion.objects.all()), 0)

    def test_disable_snake(self):
        """Disable a snake"""
        self.client.post('/snake/create', {'code': 'test code'})
        self.assertEqual(len(SnakeVersion.objects.all()), 1)
        response = self.client.post('/snake/activate/{}'.format(1), HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(len(ActiveSnake.objects.all()), 1)

        response = self.client.post('/snake/disable', HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['message'], 'Snake 1 was disabled')
        self.assertEqual(len(ActiveSnake.objects.all()), 0)
        self.assertEqual(len(SnakeVersion.objects.all()), 1)

        