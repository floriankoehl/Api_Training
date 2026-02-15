from .models import *
from django.db import models as db_models
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers



class IdeaSerializer(serializers.ModelSerializer):
    legend_type_id = serializers.PrimaryKeyRelatedField(
        queryset=LegendType.objects.all(), 
        source='legend_type', 
        allow_null=True,
        required=False
    )
    
    class Meta: 
        model = Idea
        fields = ["id", "title", "headline", "description", "category", "order_index", "legend_type_id"]


@api_view(["GET"])
def get_all_ideas(request):
    all_ideas = Idea.objects.all()
    all_ideas_serialized = IdeaSerializer(all_ideas, many=True).data
    # Build order arrays per category (None = unassigned)
    unassigned_order = list(
        Idea.objects.filter(category__isnull=True)
        .order_by('order_index')
        .values_list('id', flat=True)
    )
    category_orders = {}
    for cat in Category.objects.all():
        category_orders[cat.id] = list(
            Idea.objects.filter(category=cat)
            .order_by('order_index')
            .values_list('id', flat=True)
        )
    return Response({
        "data": all_ideas_serialized,
        "order": unassigned_order,
        "category_orders": category_orders,
    })


@api_view(["POST"])
def create_idea(request):
    title = request.data.get("idea_name", "").strip()
    description = request.data.get("description", "")
    headline = request.data.get("headline", "").strip()
    if not title:
        return Response({"error": "Title is required"}, status=400)
    from django.db.models import Max
    max_order = Idea.objects.aggregate(Max('order_index'))['order_index__max']
    next_order = (max_order + 1) if max_order is not None else 0
    idea = Idea.objects.create(title=title, description=description, headline=headline, order_index=next_order)
    return Response({"created": True, "idea": IdeaSerializer(idea).data})


@api_view(["DELETE"])
def delete_idea(request):
    idea_id = request.data.get("id")
    Idea.objects.filter(id=idea_id).delete()
    return Response({"deleted": True})


@api_view(["POST"])
def safe_order(request):
    new_order = request.data.get("order", [])
    category_id = request.data.get("category_id")  # None for unassigned list
    for index, idea_id in enumerate(new_order):
        updates = {"order_index": index}
        if category_id is not None:
            updates["category_id"] = category_id
        else:
            updates["category"] = None
        Idea.objects.filter(id=idea_id).update(**updates)
    return Response({"successful": True})


@api_view(["POST"])
def assign_idea_to_category(request):
    idea_id = request.data.get("idea_id")
    category_id = request.data.get("category_id")  # None to unassign
    idea = Idea.objects.get(id=idea_id)
    if category_id is not None:
        idea.category_id = category_id
        max_order = Idea.objects.filter(category_id=category_id).aggregate(
            db_models.Max('order_index')
        )['order_index__max']
        idea.order_index = (max_order + 1) if max_order is not None else 0
    else:
        idea.category = None
        max_order = Idea.objects.filter(category__isnull=True).aggregate(
            db_models.Max('order_index')
        )['order_index__max']
        idea.order_index = (max_order + 1) if max_order is not None else 0
    idea.save()
    return Response({"updated": True})




class CategorySerializer(serializers.ModelSerializer):
    class Meta: 
        model = Category
        fields = "__all__"


@api_view(["GET"])
def get_all_categories(request):
    all_categories = Category.objects.all()
    all_cats_ready = CategorySerializer(all_categories, many=True).data
    return Response({"categories": all_cats_ready})


@api_view(["POST"])
def create_category(request):
    input_name = request.data.get("name")

    if not input_name: 
        return Response({"error": "Name is required"}, status=400)
        

    category, created = Category.objects.get_or_create(name=input_name)
    category_serialized = CategorySerializer(category).data
    if created: 
        return Response({"status": "created", "category": category_serialized}, status=201)
    else: 
        return Response({"status": "category already existed", "category": category_serialized}, status=200)


@api_view(["POST"])
def set_position_category(request):
    category_id = request.data.get("id")
    category = Category.objects.get(id=category_id)
    new_position = request.data.get("position")
    category.x = new_position["x"]
    category.y = new_position["y"]
    category.save()
    print(f"NEW POSITIONS FOR {category.name}", new_position)
    return Response({"test": "test"})


@api_view(["POST"])
def set_area_category(request):
    category_id = request.data.get("id")
    category = Category.objects.get(id=category_id)
    category.width = request.data.get("width", category.width)
    category.height = request.data.get("height", category.height)
    category.save()
    return Response({"updated": True})


@api_view(["DELETE"])
def delete_category(request):
    category_id = request.data.get("id")
    # Reset all ideas in this category back to unassigned
    Idea.objects.filter(category_id=category_id).update(category=None)
    Category.objects.filter(id=category_id).delete()
    return Response({"deleted": True})


@api_view(["POST"])
def bring_to_front_category(request):
    category_id = request.data.get("id")
    max_z = Category.objects.aggregate(db_models.Max('z_index'))['z_index__max'] or 0
    Category.objects.filter(id=category_id).update(z_index=max_z + 1)
    return Response({"updated": True})


@api_view(["POST"])
def rename_category(request):
    category_id = request.data.get("id")
    new_name = request.data.get("name", "").strip()
    if not new_name:
        return Response({"error": "Name is required"}, status=400)
    Category.objects.filter(id=category_id).update(name=new_name)
    return Response({"updated": True})


@api_view(["POST"])
def update_idea_title(request):
    idea_id = request.data.get("id")
    new_title = request.data.get("title", "").strip()
    if not new_title:
        return Response({"error": "Title is required"}, status=400)
    Idea.objects.filter(id=idea_id).update(title=new_title)
    return Response({"updated": True})


@api_view(["POST"])
def update_idea_headline(request):
    idea_id = request.data.get("id")
    new_headline = request.data.get("headline", "").strip()
    # Headline can be empty (optional)
    Idea.objects.filter(id=idea_id).update(headline=new_headline)
    return Response({"updated": True})


@api_view(["POST"])
def toggle_archive_category(request):
    category_id = request.data.get("id")
    category = Category.objects.get(id=category_id)
    category.archived = not category.archived
    category.save()
    return Response({"archived": category.archived})


# ===== LEGEND TYPE ENDPOINTS =====

class LegendTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegendType
        fields = "__all__"


@api_view(["GET"])
def get_all_legend_types(request):
    legend_types = LegendType.objects.all()
    return Response({"legend_types": LegendTypeSerializer(legend_types, many=True).data})


@api_view(["POST"])
def create_legend_type(request):
    name = request.data.get("name", "New Type").strip()
    color = request.data.get("color", "#cccccc")
    max_order = LegendType.objects.aggregate(db_models.Max('order_index'))['order_index__max']
    next_order = (max_order + 1) if max_order is not None else 0
    legend_type = LegendType.objects.create(name=name, color=color, order_index=next_order)
    return Response({"created": True, "legend_type": LegendTypeSerializer(legend_type).data})


@api_view(["POST"])
def update_legend_type(request):
    legend_type_id = request.data.get("id")
    legend_type = LegendType.objects.get(id=legend_type_id)
    if "name" in request.data:
        legend_type.name = request.data.get("name", "").strip()
    if "color" in request.data:
        legend_type.color = request.data.get("color")
    legend_type.save()
    return Response({"updated": True, "legend_type": LegendTypeSerializer(legend_type).data})


@api_view(["DELETE"])
def delete_legend_type(request):
    legend_type_id = request.data.get("id")
    # Set all ideas using this type back to null
    Idea.objects.filter(legend_type_id=legend_type_id).update(legend_type=None)
    LegendType.objects.filter(id=legend_type_id).delete()
    return Response({"deleted": True})


@api_view(["POST"])
def assign_idea_legend_type(request):
    idea_id = request.data.get("idea_id")
    legend_type_id = request.data.get("legend_type_id")  # None to unassign
    idea = Idea.objects.get(id=idea_id)
    if legend_type_id is not None:
        idea.legend_type_id = legend_type_id
    else:
        idea.legend_type = None
    idea.save()
    return Response({"updated": True})


























class ProjectSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Project
        fields = "__all__"



@api_view(["GET"])
def get_project_details(request):
    print("Correctly inside project details")
    project = Project.objects.first()
    serialized = ProjectSerializer(project).data
    return Response({"project": serialized})










class TeamSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Team
        fields = "__all__"




@api_view(["GET"])
def fetch_project_teams(request):
    project = Project.objects.first()
    all_teams = Team.objects.filter(project=project.id)
    serialized_teams = TeamSerializer(all_teams, many=True)


    return Response({"teams": serialized_teams.data})



from rest_framework import status
from django.db import transaction

@api_view(["PATCH"])
def safe_team_order(request):
    order = request.data.get("order")

    if not isinstance(order, list):
        return Response({"error": "order must be a list"}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        for index, team_id in enumerate(order):
            Team.objects.filter(id=team_id).update(order_index=index)

    return Response({"status": "ok"})








class MilestoneSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Milestone
        fields = "__all__"






class TaskSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = "__all__"



@api_view(["GET"])
def fetch_project_tasks(request):
    project = Project.objects.first()
    all_tasks = (
        Task.objects
        .filter(project=project)
        .prefetch_related("milestones")  
        .order_by("team_id", "order_index")
    )


    serialized = TaskSerializer(all_tasks, many=True).data

    # tasks by id
    tasks_by_id = {}
    for task in serialized:
        tasks_by_id[task["id"]] = task

    # order per team
    order_per_team = {}
    for task in serialized:
        team_id = task["team"]

        if team_id not in order_per_team:
            order_per_team[team_id] = []

        order_per_team[team_id].append(task["id"])

    return Response({
        "health": "healthy",
        "tasks": tasks_by_id,
        "taskOrder": order_per_team
    })



















# Milestones





# name = models.CharField(max_length=200)
# project = models.ForeignKey(Project, on_delete=models.CASCADE, null=False)
# task = models.ForeignKey(Task, on_delete=models.CASCADE, null=False)
# start_index = models.IntegerField(default=0)
# end_index = models.IntegerField(default=0)



@api_view(["GET"])
def get_all_milestones(request):
    project_id = Project.objects.first().id
    all_milestones = Milestone.objects.filter(project = project_id)
    if all_milestones:
        serialized = MilestoneSerializer(all_milestones, many=True)
        return Response({"milestones": serialized.data})
    else: 
        return Response({"milestones": "no milestones yet"})


@api_view(["POST"])
def add_milestone(request):
    task_id = request.data.get("task_id")
    project = Project.objects.first()
    project_id = project.id
    task = Task.objects.get(id=int(task_id))
    name = f"{task.name}_0"
    start_index = 0
    duration = 1
    milestone, created = Milestone.objects.get_or_create(
        project = project,
        name = name,
        task = task,
        start_index = start_index,
        duration = duration
    )

    serialized = MilestoneSerializer(milestone)

    return Response({"added_milestone":serialized.data, "created": created})






@api_view(["PATCH"])
def update_start_index(request):
    new_index = request.data.get("index")
    milestone_id = request.data.get("milestone_id")
    milestone = Milestone.objects.get(id=milestone_id)
    milestone.start_index = new_index
    milestone.save()
    return Response({"updated": "true"})






@api_view(["DELETE"])
def delete_milestones(request):
    milestone_id = request.data.get("id")
    milestone = Milestone.objects.get(id=milestone_id)
    milestone.delete()
    return Response({"deleted": True}, status=204)






@api_view(["PATCH"])
def change_duration(request):
    milestone_id = request.data.get("id")
    milestone = Milestone.objects.get(id=milestone_id)
    change = request.data.get("change")
    duration = milestone.duration + change

    if duration < 1: 
        duration = 1

    data = {
        "duration": duration
    }
    serializer = MilestoneSerializer(milestone, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"succesfull": True, "data": serializer.data}, status=200)





