from django.contrib.auth import authenticate, get_user_model
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import BlogPost, Comment
from .serializers import (
    UserSerializer, UserCreateSerializer,
    BlogPostSerializer, BlogPostListSerializer,
    CommentSerializer,
)
from .permissions import IsOwnerOrReadOnly, IsAdminUser

User = get_user_model()

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    # username = request.data.get("username")
    # password = request.data.get("password")

    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")

    errors = {}

    if not email:
        errors["email"] = ["Email is required."]

    if not password:
        errors["password"] = ["Password is required."]
    
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {
                "email": ["No account found with this email address."]
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=user.username, password=password)

    if user is None:
        return Response(
            {
                "password": ["Incorrect password."]
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    token, _ = Token.objects.get_or_create(user=user)

    data = UserSerializer(user).data
    data["token"] = token.key

    return Response(data)

    # user = authenticate(request, username=username, password=password)
    # if user is not None:
    #     token, _ = Token.objects.get_or_create(user=user)
    #     data = UserSerializer(user).data
    #     data["token"] = token.key
    #     return Response(data)
    # return Response(
    #     {"detail": "Invalid credentials"},
    #     status=status.HTTP_401_UNAUTHORIZED,
    # )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({"detail": "Logged out"})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_user_view(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "body", "author__username", "slug"]
    ordering_fields = ["created_at", "updated_at", "title"]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "list":
            return BlogPostListSerializer
        return BlogPostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        queryset = BlogPost.objects.all()
        author_id = self.request.query_params.get("author")
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        return queryset


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        queryset = Comment.objects.all()
        post_id = self.request.query_params.get("post")
        post_slug = self.request.query_params.get("post_slug")
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        elif post_slug:
            queryset = queryset.filter(post__slug=post_slug)
        return queryset
