from rest_framework import serializers
from django.contrib.auth.models import User
from .models import BlogPost, Comment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff", "date_joined"]
        read_only_fields = ["id", "is_staff"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={
            "blank": "Password is required.",
            "min_length": "Password must be at least 8 characters."
        }
    )

    username = serializers.CharField(
        max_length=150,
        error_messages={
            "blank": "Username is required.",
            "required": "Username is required."
        }
    )

    email = serializers.EmailField(
        error_messages={
            "blank": "Email is required.",
            "required": "Email is required.",
            "invalid": "Enter a valid email address."
        }
    )
    first_name = serializers.CharField(
        max_length=100,
        error_messages={
            "blank": "First name  is required.",
            "required": "First name is required."
        }
    )

    last_name = serializers.CharField(
        max_length=100,
        error_messages={
            "blank": "Last name  is required.",
            "required": "Last name is required."
        }
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name"]
        read_only_fields = ["id"]

    def validate_username(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters."
            )

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate_first_name(self, value):
        return value.strip()

    def validate_last_name(self, value):
        return value.strip()
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "post", "author", "body", "created_at", "updated_at"]
        read_only_fields = ["id", "author", "created_at", "updated_at"]

    def validate_body(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Comment body cannot be empty.")
        return value.strip()


class BlogPostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "body", "image", "image_url", "tags", "author",
            "comments", "comments_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "author", "created_at", "updated_at"]

    def validate(self, attrs):
        request = self.context.get("request")

        image = request.FILES.get("image") if request else None
        remove_image = request.data.get("remove_image") == "true" if request else False

        # Create - image is required
        if self.instance is None:
            if not image:
                raise serializers.ValidationError({
                    "image": ["Please upload an image."]
                })
        # Update - image required only if user removed existing one
        else:
            if remove_image and not image:
                raise serializers.ValidationError({
                    "image": ["Please upload an image."]
                })

        return attrs

    
    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Title cannot be empty.")

        if len(value) > 200:
            raise serializers.ValidationError("Title cannot exceed 200 characters.")

        return value

    def validate_body(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Body cannot be empty.")

        return value

    def validate_tags(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Please select at least one tag")
        if len(value) > 500:
            raise serializers.ValidationError("Tags cannot exceed 500 characters.")
        return value

    def validate_image(self, value):
        import os
        ext = os.path.splitext(value.name)[1].lower()
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        if ext not in valid_extensions:
            raise serializers.ValidationError("Image must be a JPG, PNG, GIF, or WebP file.")
        if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Image size must be less than 5MB.")
        return value


class BlogPostListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "body", "image", "image_url", "tags", "author",
            "comments_count", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "author", "created_at", "updated_at"]

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
