# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import serializers

# from .models import Task, Idea, IdeaOrder

from .models import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers


# class TaskSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Task
#         fields = "__all__"


# @api_view(["GET"])
# def get_all_tasks(request):
#     tasks = Task.objects.all()
#     serializer = TaskSerializer(tasks, many=True)
#     return Response(serializer.data)


# @api_view(["POST"])
# def create_task(request):
#     title = request.data.get("task_title", "").strip()
#     if not title:
#         return Response({"error": "Title is required"}, status=400)
#     task, created = Task.objects.get_or_create(title=title)
#     return Response(TaskSerializer(task).data, status=201 if created else 200)


# @api_view(["DELETE"])
# def delete_task(request):
#     title = request.data.get("title_to_delete")
#     Task.objects.filter(title=title).delete()
#     return Response({"deleted": True})


# @api_view(["PATCH"])
# def update_task(request, pk):
#     """Partial update a single task (done, x, y, etc.)."""
#     try:
#         task = Task.objects.get(pk=pk)
#     except Task.DoesNotExist:
#         return Response({"error": "Not found"}, status=404)
#     serializer = TaskSerializer(task, data=request.data, partial=True)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data)
#     return Response(serializer.errors, status=400)


# @api_view(["POST"])
# def toggle_done(request):
#     title = request.data.get("title_to_mark")
#     done_type = request.data.get("type", "toggle")
#     task = Task.objects.get(title=title)

#     if done_type == "done":
#         task.done = True
#     elif done_type == "scheduled":
#         task.done = False
#     else:
#         task.done = not task.done
#     task.save()
#     return Response(TaskSerializer(task).data)


# @api_view(["POST"])
# def update_x_and_y_of_tasks(request):
#     all_tasks = request.data.get("tasks", {})
#     for task_name, task_data in all_tasks.items():
#         Task.objects.filter(title=task_name).update(
#             x=task_data.get("x", 0),
#             y=task_data.get("y", 0),
#         )
#     return Response({"updated": True})






# # class TaskSerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = Task
# #         fields = "__all__"



class IdeaSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Idea
        fields = "__all__"


@api_view(["GET"])
def get_all_ideas(request):
    all_ideas = Idea.objects.all()
    all_ideas_serialized = IdeaSerializer(all_ideas, many=True).data
    order = list(Idea.objects.order_by('order_index').values_list('id', flat=True))
    return Response({"data": all_ideas_serialized, "order": order})


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
    for index, idea_id in enumerate(new_order):
        Idea.objects.filter(id=idea_id).update(order_index=index)
    return Response({"successful": True})




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




# id: category_id,
# position: new_position

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
    data = request.data.get("")
    return Response({"test": "test"})







@api_view(["POST"])
def delete_category(request):
    data = request.data.get("")
    return Response({"test": "test"})






















