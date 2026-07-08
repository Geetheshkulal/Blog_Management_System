from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"users", views.UserViewSet)
router.register(r"posts", views.BlogPostViewSet)
router.register(r"comments", views.CommentViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("auth/login/", views.login_view, name="login"),
    path("auth/logout/", views.logout_view, name="logout"),
    path("me/", views.current_user, name="current-user"),
    path("admin/create-user/", views.create_user_view, name="create-user"),
]
