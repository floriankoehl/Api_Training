from django.db import models


class Task(models.Model):
    title = models.TextField()
    done = models.BooleanField(default=False)
    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)









class Idea(models.Model):
    name = models.TextField()
    description = models.TextField(blank=True)
    category = models.TextField(blank=True)

class IdeaOrder(models.Model):
    order = models.JSONField(default=list)

    def recompute(self):
        all_current_ids = set(
            Idea.objects.values_list("id", flat=True)
        )

        self.order = [
            id for id in self.order
            if id in all_current_ids
        ]

        self.save()

            


