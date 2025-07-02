from django.contrib import admin
from .models import SharedError, ErrorFile, Comment

@admin.register(SharedError)
class SharedErrorAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_at',)  
    list_filter = ('created_at',)
    search_fields = ('title', 'id', 'creator_name')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'shared_error', 'name', 'comment_time')
    list_filter = ('comment_time',)
    search_fields = ('content', 'commentor_name', 'shared_error')
    readonly_fields = ('comment_time',)
    ordering = ('-comment_time',)

@admin.register(ErrorFile)
class ErrorFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'filename', 'language')
    list_filter = ('shared_error', 'language')
    search_fields = ('shared_error', 'language')