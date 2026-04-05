from django.contrib import admin
from .models import CustomUser
from django.contrib import admin
from django.utils.html import format_html
from .models import CustomUser, Report


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'status', 'is_active','cv_file_link')
    list_filter = ('role', 'status')
    search_fields = ('email', 'name')
    def cv_file_link(self, obj):
        if obj.cv_file:
            return format_html("<a href='{}' target='_blank'>تحميل CV</a>", obj.cv_file.url)
        return "لا يوجد"
    
    cv_file_link.short_description = "CV"

    from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'engineer', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('reporter__email', 'engineer__email', 'content')
