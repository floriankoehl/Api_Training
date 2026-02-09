from django.db import models


class Task(models.Model):
    title = models.TextField()
    done = models.BooleanField(default=False)
    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)

