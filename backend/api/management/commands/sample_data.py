from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from api.models import Project, Team


class Command(BaseCommand):
    def handle(self, *args, **kwargs):

        # Create sample project
        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=90)

        project = Project.objects.create(
            name="Sample Project Alpha",
            start_date=start_date,
            end_date=end_date
        )

        # Sample teams
        team_names = [
            "Design",
            "Backend",
            "Frontend",
            "Marketing",
            "Operations",
            "QA",
            "Management",
        ]

        colors = [
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
            "#FFA69E",
            "#6A4C93",
            "#FFD166",
            "#2EC4B6",
        ]

        for index, (name, color) in enumerate(zip(team_names, colors)):
            Team.objects.create(
                name=name,
                project=project,
                color=color,
                order_index=index
            )

        print("Sample project with teams created.")
