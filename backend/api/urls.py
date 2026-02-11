from django.urls import path
from .views import *


urlpatterns = [
    # path("get_all_tasks/", get_all_tasks),
    # path("create_task/", create_task),
    # path("delete_task/", delete_task),
    # path("toggle_done/", toggle_done),
    # path("update_task/<int:pk>/", update_task),
    # path("update_x_and_y_of_tasks/", update_x_and_y_of_tasks),
    # path("create_idea/", create_idea),
    # path("get_all_ideas/", get_all_ideas),
    # path("delete_idea/", delete_idea),
    # path("get_order/", get_order),
    # path("safe_order/", safe_order),
    # path("set_category/", set_category)
    path("get_all_categories/", get_all_categories),
    path("create_category/", create_category),
    path("bring_to_front_category/", bring_to_front_category),
    path("delete_category/", delete_category),
    path("set_position_category/", set_position_category),
    path("set_area_category/", set_area_category),

    path("get_all_ideas/", get_all_ideas),
    path("create_idea/", create_idea),
    path("delete_idea/", delete_idea),
    path("safe_order/", safe_order),
    path("assign_idea_to_category/", assign_idea_to_category),
    path("rename_category/", rename_category),
    path("update_idea_title/", update_idea_title),
    path("toggle_archive_category/", toggle_archive_category),
]
