from django.urls import path
from .views import *


urlpatterns = [
    path("get_all_tasks/", get_all_tasks),
    path("create_task/", create_task),
    path("delete_task/", delete_task),
    path("toggle_done/", toggle_done),
    path("update_task/<int:pk>/", update_task),
    path("update_x_and_y_of_tasks/", update_x_and_y_of_tasks),
    path("create_idea/", create_idea),
    path("get_all_ideas/", get_all_ideas),
    path("delete_idea/", delete_idea),
    path("get_order/", get_order)
]
