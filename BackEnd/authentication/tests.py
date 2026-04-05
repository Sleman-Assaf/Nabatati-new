
# from django.urls import reverse
# from rest_framework import status
# from rest_framework.test import APITestCase
# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from datetime import timedelta

# User = get_user_model()

# class AuthenticationTests(APITestCase):
#     def setUp(self):
#         # Create test users
#         self.regular_user = User.objects.create_user(
#             email='user@example.com',
#             name='Regular User', # Assuming 'name' is the username field
#             password='testpass123',
#             role='user',
#             is_email_verified=True
#         )
        
#         self.unverified_user = User.objects.create_user(
#             email='unverified@example.com',
#             name='Unverified User', # Assuming 'name' is the username field
#             password='testpass123',
#             role='user',
#             is_email_verified=False,
#             email_verification_token='testtoken',
#             email_verification_token_expires_at=timezone.now() + timedelta(hours=1)
#         )
        
#         # Add other setup data if needed from your original tests

#     # --- Keep your existing test methods here --- 
#     # e.g., test_user_login, test_engineer_registration, etc.

#     # --- New Test Case for Unique Username --- 
#     def test_duplicate_username_registration(self):
#         """
#         Ensure that registering with an existing username (name field) fails.
#         """
#         # URL for user registration
#         register_url = reverse('user_register') # Make sure 'user_register' is the correct name in your urls.py
        
#         # Data for the first user registration
#         user_data_1 = {
#             'name': 'jihad',
#             'email': 'jihad1@example.com',
#             'password': 'password123',
#             'password2': 'password123'
#         }
        
#         # First registration attempt - should succeed
#         response1 = self.client.post(register_url, user_data_1, format='json')
#         self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
#         self.assertTrue(User.objects.filter(name='jihad').exists())

#         # Data for the second user registration with the same name but different email
#         user_data_2 = {
#             'name': 'jihad', # Same name as the first user
#             'email': 'jihad2@example.com',
#             'password': 'password123',
#             'password2': 'password123'
#         }

#         # Second registration attempt - should fail due to duplicate name
#         response2 = self.client.post(register_url, user_data_2, format='json')
#         self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
#         # Check for the specific error message defined in the serializer
#         self.assertIn('name', response2.data)
#         self.assertEqual(response2.data['name'][0], "اسم المستخدم هذا موجود بالفعل.")
        
#         # Verify that the second user was not created
#         self.assertEqual(User.objects.count(), 3) # setUp created 2 users, first registration created 1 more

#     # --- Add other test methods from your original file below --- 


from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        # Create test users
        self.regular_user = User.objects.create_user(
            email='user@example.com',
            name='Regular User', # Assuming 'name' is the username field
            password='testpass123',
            role='user',
            is_email_verified=True
        )
        
        self.unverified_user = User.objects.create_user(
            email='unverified@example.com',
            name='Unverified User', # Assuming 'name' is the username field
            password='testpass123',
            role='user',
            is_email_verified=False,
            email_verification_token='testtoken',
            email_verification_token_expires_at=timezone.now() + timedelta(hours=1)
        )
        
        # Add other setup data if needed from your original tests

    # --- Keep your existing test methods here --- 
    # e.g., test_user_login, test_engineer_registration, etc.

    # --- New Test Case for Unique Username --- 
    def test_duplicate_username_registration(self):
        """
        Ensure that registering with an existing username (name field) fails.
        """
        # URL for user registration
        register_url = reverse('user_register') # Make sure 'user_register' is the correct name in your urls.py
        
        # Data for the first user registration
        user_data_1 = {
            'name': 'jihad',
            'email': 'jihad1@example.com',
            'password': 'password123',
            'password2': 'password123'
        }
        
        # First registration attempt - should succeed
        response1 = self.client.post(register_url, user_data_1, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(name='jihad').exists())

        # Data for the second user registration with the same name but different email
        user_data_2 = {
            'name': 'jihad', # Same name as the first user
            'email': 'jihad2@example.com',
            'password': 'password123',
            'password2': 'password123'
        }

        # Second registration attempt - should fail due to duplicate name
        response2 = self.client.post(register_url, user_data_2, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        # Check for the specific error message defined in the serializer
        self.assertIn('name', response2.data)
        self.assertEqual(response2.data['name'][0], "اسم المستخدم هذا موجود بالفعل.")
        
        # Verify that the second user was not created
        self.assertEqual(User.objects.count(), 3) # setUp created 2 users, first registration created 1 more

    # --- Add other test methods from your original file below --- 



