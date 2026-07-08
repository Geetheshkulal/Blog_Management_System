# Blog Management System

A full-stack blog management system built with Django REST Framework (backend) and React.js (frontend with Vite).

## Features

- User authentication (login/logout)
- Admin can create users
- CRUD operations on blog posts (own posts only)
- View all blog posts
- Add, edit, and delete comments on blog posts
- Search functionality for posts

## Backend Setup
- Clone Repository
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r ../requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend API: `http://localhost:8000/api/`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/me/` | Current user |
| GET/POST | `/api/posts/` | List/Create posts |
| GET/PUT/DELETE | `/api/posts/{id}/` | Retrieve/Update/Delete post |
| GET/POST | `/api/comments/` | List/Create comments |
| GET/PUT/DELETE | `/api/comments/{id}/` | Retrieve/Update/Delete comment |
| GET/POST | `/api/users/` | List/Create users (admin only) |

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## Default Admin Account

- **Email:** admin@example.com
- **Password:** admin@123
