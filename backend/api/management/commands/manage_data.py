from django.core.management.base import BaseCommand
from api.models import Category, Idea

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        
        for i in range(10):
            Category.objects.create(name=f"category_{i}")
        
        for i in range(10):
            Idea.objects.create(title=f"idea_{i}")

        print("Done.")
