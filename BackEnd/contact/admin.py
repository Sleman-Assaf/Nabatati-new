from django.contrib import admin
from .models import ContactMessage

class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('email', 'phone', 'created_at')

admin.site.register(ContactMessage, ContactMessageAdmin)