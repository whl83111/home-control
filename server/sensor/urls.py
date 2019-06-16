from django.urls import path
from . import views

urlpatterns = [
    path('getData', views.getData, name='getData'),
    path('pushData', views.pushData, name='pushData')
]
