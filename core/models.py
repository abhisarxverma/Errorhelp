import uuid
from django.db import models
from django.utils import timezone
from django.utils.dateformat import format

class SharedError(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    delete_key = models.UUIDField(default=uuid.uuid4, editable=False)
    error_text = models.TextField()
    title = models.CharField(max_length=150)
    description = models.TextField()
    creator_name = models.CharField(max_length=70)

    def to_dict(self):
        return {
            "id" : str(self.id),
            "created_at" : self.created_at,
            "delete_key" : str(self.delete_key),
            "error_text" : self.error_text,
            "title" : self.title,
            "description" : self.description,
            "creator_name" : self.creator_name
        }

class ErrorFile(models.Model):
    shared_error = models.ForeignKey(SharedError, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=300)
    content = models.TextField()
    language = models.CharField(max_length=50, blank=True)

    def to_dict(self):
        return {
            "filename" : self.filename,
            "content" : self.content,
            "language" : self.language,
            "shared_error_id" : str(self.shared_error.id)
        }

class Comment(models.Model):
    name = models.CharField(max_length=50)
    content = models.TextField()
    comment_time = models.DateTimeField(auto_now_add=True)
    shared_error = models.ForeignKey(SharedError, on_delete=models.CASCADE, related_name="comments")

    def to_dict(self):
        return {
            "commentor_name" : self.name,
            "content" : self.content,
            # "comment_time": format(self.comment_time, 'N j, Y, P'),
            "comment_time" : self.comment_time,
            "shared_error" : str(self.shared_error.id)
        }