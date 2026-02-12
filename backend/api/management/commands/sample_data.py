from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from api.models import Project, Team, Task


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        Task.objects.all().delete()
        Team.objects.all().delete()
        Project.objects.all().delete()






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

        teams = []
        for index, (name, color) in enumerate(zip(team_names, colors)):
            team = Team.objects.create(
                name=name,
                project=project,
                color=color,
                order_index=index
            )
            teams.append(team)

        # Task name pools per team (so it feels meaningful)
        task_pool = {
            "Design": ["Wireframes", "Moodboard", "Component Library", "Mobile Layout", "Icons"],
            "Backend": ["Auth System", "Database Schema", "API Routes", "Permissions", "Caching"],
            "Frontend": ["Navbar", "Dashboard UI", "Drag & Drop", "Forms", "Animations"],
            "Marketing": ["Landing Page Copy", "Newsletter", "Campaign Plan", "SEO", "Ad Creatives"],
            "Operations": ["Deployment", "Monitoring", "Backups", "CI Pipeline"],
            "QA": ["Unit Tests", "Integration Tests", "Bug Bash", "Regression Tests"],
            "Management": ["Roadmap", "Sprint Planning", "Stakeholder Meeting", "Budget Review"],
        }

        # Create tasks (1–5 per team, avg ≈3)
        for team in teams:
            possible_tasks = task_pool.get(team.name, ["Task A", "Task B", "Task C"])
            amount = random.randint(1, 5)

            selected_tasks = random.sample(possible_tasks, min(amount, len(possible_tasks)))

            for idx, task_name in enumerate(selected_tasks):
                Task.objects.create(
                    name=task_name,
                    project=project,
                    team=team,
                    order_index=idx
                )

        print("Sample project, teams, and tasks created.")
        print(Project.objects.all())
        print(Task.objects.count())
        print(Task.objects.filter(project=project).count())
