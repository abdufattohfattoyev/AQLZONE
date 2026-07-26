"""
Kichik CORS middleware.

`django-cors-headers` paketi shart emas: bizda cookie yo'q, himoya faqat
Bearer token orqali. Shuning uchun ruxsat etilgan origin'ni sozlamadan
olamiz (standarti "*") va preflight'ga darhol javob qaytaramiz.
"""
from django.conf import settings
from django.http import HttpResponse

RUXSAT_METOD = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
RUXSAT_SARLAVHA = "Content-Type, Authorization"


class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.origin = settings.CORS_ALLOW_ORIGIN

    def __call__(self, request):
        if request.method == "OPTIONS" and "HTTP_ACCESS_CONTROL_REQUEST_METHOD" in request.META:
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)

        response["Access-Control-Allow-Origin"] = self.origin
        response["Access-Control-Allow-Methods"] = RUXSAT_METOD
        response["Access-Control-Allow-Headers"] = RUXSAT_SARLAVHA
        response["Access-Control-Max-Age"] = "86400"
        if self.origin != "*":
            # Kesh turli origin uchun bir xil javobni qaytarib yubormasin.
            response["Vary"] = "Origin"
        return response
