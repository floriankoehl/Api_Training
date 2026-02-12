from .models import *
from django.db import models as db_models
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers



class IdeaSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Idea
        fields = "__all__"


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
    if not title:
        return Response({"error": "Title is required"}, status=400)
    from django.db.models import Max
    max_order = Idea.objects.aggregate(Max('order_index'))['order_index__max']
    next_order = (max_order + 1) if max_order is not None else 0
    idea = Idea.objects.create(title=title, description=description, order_index=next_order)
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
def toggle_archive_category(request):
    category_id = request.data.get("id")
    category = Category.objects.get(id=category_id)
    category.archived = not category.archived
    category.save()
    return Response({"archived": category.archived})










































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






