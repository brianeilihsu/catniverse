from django.urls import path
from . import views

urlpatterns = [
    path('cat-ear-detection/', views.cat_ear_detection, name='cat_ear_detection'),
]
