from django.urls import path, re_path
from django.views.static import serve
from django.conf import settings

from . import views

app_name = "core"

urlpatterns = [
    path("", views.home, name="home"),
    path("new_errorframe", views.newError, name="new_error"),
    path("errorframe/<str:error_id>", views.showError, name="show_error"),
    path("post_comment", views.saveComment, name="save_comment"),
    path("get_comments", views.getComments, name="get_comments"),
    path("delete_errorframe/<str:error_id>", views.deleteErrorframe, name="delete_errorframe"),
    path("send_review", views.send_review, name="send_review"),

    re_path(r'^sitemap\.xml$', serve, {
        'document_root': settings.STATIC_ROOT,
        'path': 'sitemap.xml'
    }),
]