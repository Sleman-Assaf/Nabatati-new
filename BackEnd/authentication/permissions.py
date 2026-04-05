# from rest_framework import permissions

# class IsAdmin(permissions.BasePermission):
#     """
#     Allows access only to admin users.
#     """
#     def has_permission(self, request, view):
#         return request.user and request.user.role == 'admin'

# class IsEngineer(permissions.BasePermission):
#     """
#     Allows access only to engineers.
#     """
#     def has_permission(self, request, view):
#         return request.user and request.user.role == 'engineer'

# class IsActiveEngineer(permissions.BasePermission):
#     """
#     Allows access only to active engineers (status=1).
#     """
#     def has_permission(self, request, view):
#         return request.user and request.user.role == 'engineer' and request.user.status == 1

# class IsRegularUser(permissions.BasePermission):
#     """
#     Allows access only to regular users.
#     """
#     def has_permission(self, request, view):
#         return request.user and request.user.role == 'user'
from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'

class IsEngineer(permissions.BasePermission):
    """
    Allows access only to engineers.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'engineer'

class IsActiveEngineer(permissions.BasePermission):
    """
    Allows access only to active engineers (status=1).
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'engineer' and request.user.status == 1

class IsRegularUser(permissions.BasePermission):
    """
    Allows access only to regular users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'user'