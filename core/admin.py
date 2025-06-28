from django.contrib import admin
from .models import SharedError, ErrorFile, Comment

# Register your models here.
admin.site.register(SharedError)
admin.site.register(ErrorFile)
admin.site.register(Comment)