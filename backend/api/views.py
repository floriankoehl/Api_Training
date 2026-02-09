from rest_framework import generics

from .models import Example
from .serializers import ExampleSerializer


class ExampleListCreateView(generics.ListCreateAPIView):
	queryset = Example.objects.all().order_by("-created_at")
	serializer_class = ExampleSerializer


class ExampleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Example.objects.all()
	serializer_class = ExampleSerializer
