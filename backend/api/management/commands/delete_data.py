from django.core.management.base import BaseCommand
from api.models import Category, Idea


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        Category.objects.all().delete()
        Idea.objects.all().delete()
        print("correctly deleted all data from category")