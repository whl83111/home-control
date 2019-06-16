from django.db import models

# Create your models here.
class WaterPressure(models.Model):
    time = models.DateTimeField(auto_now_add=True)
    pressure_value = models.FloatField()
