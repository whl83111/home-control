import json
import re
import datetime
import enum
import pytz
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.core import serializers
from .models import WaterPressure

TPE = pytz.timezone('Asia/Taipei')

class DataInverval(enum.IntEnum):
    '''資料區間列舉'''
    last10Data = 0 # 最新 10 筆資料
    last12Hours = 1 # 最新 12 小時資料
    last24Hours = 2 # 最新 24 小時資料


@require_GET # 只能使用 GET request
def getData(request):
    '''回傳最新 10 筆水壓資料'''
    
    # 取得 query 中的 `type` 值
    dataIntervalType = int(request.GET.get('type'))
    
    if dataIntervalType == DataInverval.last10Data:
        # 從資料庫取得最新 10 筆資料
        queries = WaterPressure.objects.order_by('-time').values('time', 'pressure_value')[:10]
    elif dataIntervalType == DataInverval.last12Hours:
        # 從資料庫取得最新 12 小時資料
        last12Hours = datetime.datetime.now() - datetime.timedelta(hours = 12)
        queries = WaterPressure.objects.order_by('-time').filter(time__gte=last12Hours).values('time', 'pressure_value')
    elif dataIntervalType == DataInverval.last24Hours:
        # 從資料庫取得最新 24 小時資料
        last24Hours = datetime.datetime.now() - datetime.timedelta(hours = 24)
        queries = WaterPressure.objects.order_by('-time').filter(time__gte=last24Hours).values('time', 'pressure_value')
    else:
        queries = WaterPressure.objects.order_by('-time').values('time', 'pressure_value')[:10]
    
    # 轉換時區
    for query in queries:
        query['time'] = query['time'].astimezone(TPE).strftime('%Y-%m-%d %H:%M:%S')
    
    responseData = list(queries)
    response = JsonResponse(responseData, safe=False)
    return response

BODY_PATTERN = r'pressure=([0-9]+)'
OFFSET = 0.48675
PRESSURE_VALUE_CONST = 400
def parsePressureValue(body):
    '''轉換arduino讀到的數值為水壓數值'''
    
    # parse 從 POST request 得到的 body
    rawValue = float(re.findall(BODY_PATTERN, body)[0])
    
    # 轉換公式
    pressureValue = round(((rawValue * 5 / 1024) - OFFSET) * PRESSURE_VALUE_CONST, 2)
    
    return pressureValue

@csrf_exempt # 允許 CSRF
@require_POST # 只能使用 POST request
def pushData(request):
    '''給 arduino 傳送水壓數值到資料庫'''
    
    body = request.body.decode()
    try:
        pressureValue = parsePressureValue(body)
        
        query = WaterPressure(pressure_value=pressureValue)
        query.save()
    except Exception as error:
        print(error, 'body:', body)
    finally:
        return HttpResponse()
