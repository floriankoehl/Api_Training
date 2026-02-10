from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers

from .models import Task, Idea, IdeaOrder


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"


@api_view(["GET"])
def get_all_tasks(request):
    tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def create_task(request):
    title = request.data.get("task_title", "").strip()
    if not title:
        return Response({"error": "Title is required"}, status=400)
    task, created = Task.objects.get_or_create(title=title)
    return Response(TaskSerializer(task).data, status=201 if created else 200)


@api_view(["DELETE"])
def delete_task(request):
    title = request.data.get("title_to_delete")
    Task.objects.filter(title=title).delete()
    return Response({"deleted": True})


@api_view(["PATCH"])
def update_task(request, pk):
    """Partial update a single task (done, x, y, etc.)."""
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    serializer = TaskSerializer(task, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
def toggle_done(request):
    title = request.data.get("title_to_mark")
    done_type = request.data.get("type", "toggle")
    task = Task.objects.get(title=title)

    if done_type == "done":
        task.done = True
    elif done_type == "scheduled":
        task.done = False
    else:
        task.done = not task.done
    task.save()
    return Response(TaskSerializer(task).data)


@api_view(["POST"])
def update_x_and_y_of_tasks(request):
    all_tasks = request.data.get("tasks", {})
    for task_name, task_data in all_tasks.items():
        Task.objects.filter(title=task_name).update(
            x=task_data.get("x", 0),
            y=task_data.get("y", 0),
        )
    return Response({"updated": True})






# class TaskSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Task
#         fields = "__all__"



class IdeaSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Idea
        fields = "__all__"





@api_view(["POST"])
def create_idea(request):
    name_of_idea = request.data.get("idea_name")
    print("correctly inside here", name_of_idea)
    idea, created = Idea.objects.get_or_create(name=name_of_idea)
    idea_serialized = IdeaSerializer(idea).data
    return Response({"created": False, "idea": idea_serialized})



@api_view(["GET"])
def get_all_ideas(request):
    all_ideas = Idea.objects.all()
    all_ideas_serialized = IdeaSerializer(all_ideas, many = True).data
    return Response({"data": all_ideas_serialized})


@api_view(["DELETE"])
def delete_idea(request):
    idea_to_delete = request.data.get("name")
    idea = Idea.objects.get(name = idea_to_delete)
    idea.delete()
    return Response({"deleted": True})



class IdeaOrderSerializer(serializers.ModelSerializer):
    class Meta: 
        model = IdeaOrder
        fields = "__all__"


@api_view(["GET"])
def get_order(request):
    order = IdeaOrder.objects.get(id=1)
    order_serialized = IdeaOrderSerializer(order).data
    return Response({"data": order_serialized})





