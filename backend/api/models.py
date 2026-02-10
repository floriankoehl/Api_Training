from django.db import models


class Task(models.Model):
    title = models.TextField()
    done = models.BooleanField(default=False)
    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)









class Idea(models.Model):
    name = models.TextField()

class IdeaOrder(models.Model):
    order = models.JSONField(default=list)

