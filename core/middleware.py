from django.http import JsonResponse
from django.core.cache import cache
import time

# TOOK FROM THE CLAUDE, THIS IS MY FIRST FULL STACK SITE SO NEEDED TO LEARN THIS THING

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        rate_limit_paths = [
            '/send_review',
            '/post_comment',
            '/new_errorframe'
        ]
        
        # Check if this path should be rate limited
        should_rate_limit = any(path in request.path.lower() for path in rate_limit_paths)

        if not should_rate_limit or request.method != 'POST':
            return self.get_response(request)
        
        if not should_rate_limit:
            return self.get_response(request)
    
        # Skip rate limiting for admin and static files
        if request.path.startswith('/admin/') or request.path.startswith('/static/'):
            return self.get_response(request)
        
        # Get client IP
        ip = self.get_client_ip(request)
        
        # Create cache key
        cache_key = f"rate_limit_{ip}_{request.path}"
        
        # Get current request count
        current_requests = cache.get(cache_key, [])
        now = time.time()
        
        # Remove old requests (older than 1 hour)
        current_requests = [req_time for req_time in current_requests 
                          if now - req_time < 3600]
        
        # Check if limit exceeded (5 requests per hour)
        if len(current_requests) >= 3:
            return JsonResponse({"status":"failed", "message":"Too many requests. Try again later."}, status=429)
        
        # Add current request
        current_requests.append(now)
        cache.set(cache_key, current_requests, 3600)
        
        response = self.get_response(request)
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
