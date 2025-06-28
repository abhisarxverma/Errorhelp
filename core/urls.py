from django.urls import path

from . import views

app_name = "core"

urlpatterns = [
    path("", views.home, name="home"),
    path("new_errorframe", views.newError, name="new_error"),
    path("errorframe/<str:error_id>", views.showError, name="show_error"),
    path("post_comment", views.saveComment, name="save_comment"),
    path("get_comments", views.getComments, name="get_comments"),
    path("delete_errorframe/<str:error_id>", views.deleteErrorframe, name="delete_errorframe")
]