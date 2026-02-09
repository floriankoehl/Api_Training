from django.urls import path
from .views import get_all_tasks, create_task, delete_task, toggle_done, update_task, update_x_and_y_of_tasks


urlpatterns = [
    path("get_all_tasks/", get_all_tasks),
    path("create_task/", create_task),
    path("delete_task/", delete_task),
    path("toggle_done/", toggle_done),
    path("update_task/<int:pk>/", update_task),
    path("update_x_and_y_of_tasks/", update_x_and_y_of_tasks),
]
