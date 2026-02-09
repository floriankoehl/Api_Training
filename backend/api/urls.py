from django.urls import path

from .views import ExampleListCreateView, ExampleRetrieveUpdateDestroyView


urlpatterns = [
    path("examples/", ExampleListCreateView.as_view(), name="example-list-create"),
    path("examples/<int:pk>/", ExampleRetrieveUpdateDestroyView.as_view(), name="example-detail"),
]
