import time
import logging
from functools import wraps
from flask import request, g
import psutil
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def monitor_performance(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        g.start_time = start_time
        process = psutil.Process(os.getpid())
        memory_before = process.memory_info().rss / 1024 / 1024
        try:
            result = f(*args, **kwargs)
            execution_time = time.time() - start_time
            memory_after = process.memory_info().rss / 1024 / 1024  
            memory_delta = memory_after - memory_before
            logger.info(f"API Performance: {request.endpoint} | "
                       f"Time: {execution_time:.3f}s | "
                       f"Memory: {memory_after:.1f}MB (+{memory_delta:.1f}MB) | "
                       f"Method: {request.method} | "
                       f"Status: Success")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"API Error: {request.endpoint} | "
                        f"Time: {execution_time:.3f}s | "
                        f"Error: {str(e)} | "
                        f"Method: {request.method}")
            raise
    return decorated_function

def get_system_stats():
    memory = psutil.virtual_memory()
    cpu_percent = psutil.cpu_percent(interval=1)
    return {
        'memory_total': memory.total / 1024 / 1024 / 1024,  
        'memory_available': memory.available / 1024 / 1024 / 1024,  
        'memory_percent': memory.percent,
        'cpu_percent': cpu_percent,
        'cpu_count': psutil.cpu_count()
    }

class RequestLogger:
    @staticmethod
    def log_request():
        logger.info(f"Request: {request.method} {request.url} | "
                   f"User-Agent: {request.headers.get('User-Agent', 'Unknown')} | "
                   f"IP: {request.remote_addr}")
        
    @staticmethod
    def log_response(response):
        execution_time = time.time() - g.get('start_time', time.time())
        logger.info(f"Response: {response.status_code} | "
                   f"Size: {len(response.get_data())} bytes | "
                   f"Time: {execution_time:.3f}s")
        return response
