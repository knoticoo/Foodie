# Deployment Guide

## Database Decision: PostgreSQL ✅

This project uses **PostgreSQL** as the primary database. The backend includes fallback to mock data for development when PostgreSQL is not available.

## Environment Configuration

### Backend (.env in project root)
```env
# Backend API
API_HOST=0.0.0.0
API_PORT=3000
CORS_ORIGIN=http://your-domain.com,http://your-domain.com:5173

# Database - PostgreSQL
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=recipes
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=recipes

# JWT & Security
JWT_SECRET=your_secure_jwt_secret
BCRYPT_ROUNDS=10

# Admin API Key (required for admin panel)
ADMIN_API_KEY=your_admin_api_key

# Stripe (optional)
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

### Admin Panel (admin/web/.env)
```env
VITE_ADMIN_API_KEY=your_admin_api_key
VITE_API_BASE_URL=http://your-domain.com:3000
```

## Services Architecture

- **Backend API**: Port 3000 (Express.js + PostgreSQL)
- **Admin Panel**: Port 5173 (React + Vite)
- **Main Site**: Port 5174 (React + Vite) 
- **PostgreSQL**: Port 5432
- **Static Files**: Port 8080

## Admin Panel Features

### ✅ Implemented
- **Server Status Module**: Real-time API and database monitoring
- **Statistics Module**: User, recipe, and comment counts from database
- **Users Management**: View and manage user accounts with admin/premium status
- **Recipes Management**: Interface for recipe CRUD operations
- **Clean Design**: Removed all mockup data, simplified interface

### 🔧 Configuration Required
1. Set `ADMIN_API_KEY` in backend environment
2. Ensure PostgreSQL is running and accessible
3. Admin users must exist in database for panel access

## Authentication Flow

1. **Login/Signup**: Works with PostgreSQL backend
2. **Admin Access**: Checks database for `is_admin` flag
3. **API Security**: Admin endpoints require valid API key

## Database Schema

The application expects PostgreSQL with tables:
- `users` (with `is_admin`, `is_premium` flags)
- `recipes`
- `recipe_comments`
- `recipe_ratings`

## Troubleshooting

### "Server Status: Offline"
- Check `ADMIN_API_KEY` matches between backend and admin panel
- Verify PostgreSQL connection
- Check CORS configuration for admin panel domain

### Login/Signup Not Working
- Ensure backend API is running on correct port
- Check PostgreSQL connection
- Verify JWT_SECRET is configured

### Admin Panel Access Denied
- User must have `is_admin=true` in database
- Check admin API key configuration