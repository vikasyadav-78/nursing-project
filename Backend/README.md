# Educational Portal Backend & Admin API Documentation

This directory contains the core REST APIs and database models inspired by **GetMyUni** educational directory platform structure.

## Architecture

- **Framework**: Express.js (ES Modules)
- **Database ORM**: Drizzle ORM with MySQL2 (`mysql2`)
- **Authentication**: JWT token base & cookie auth (`jsonwebtoken`, `bcryptjs`)
- **File Storage**: AWS S3 integration + local uploads fallback

---

## API Endpoints Overview

### 1. Authentication (`/api/auth`)
- `POST /api/auth/login` - Admin/User login
- `POST /api/auth/register` - Create user account
- `GET /api/auth/me` - Get current session details

### 2. Colleges API (`/api/college`)
- `GET /api/college` - Get list of colleges (filterable by name, code, state, city)
- `GET /api/college/:id` - Get college details
- `POST /api/college` - Add new college profile
- `PUT /api/college/:id` - Update college details
- `DELETE /api/college/:id` - Delete college

### 3. Courses API (`/api/course`)
- `GET /api/course` - List all active courses
- `POST /api/course` - Create course
- `PUT /api/course/:id` - Update course
- `DELETE /api/course/:id` - Remove course

### 4. Entrance Exams API (`/api/exams`) *(GetMyUni Feature)*
- `GET /api/exams` - List entrance exams (Medical, Nursing, Engineering, etc.)
- `POST /api/exams` - Add entrance exam details and admission dates
- `PUT /api/exams/:id` - Update exam alert/date schedule
- `DELETE /api/exams/:id` - Delete entrance exam

### 5. Admission Leads & Enquiries (`/api/leads`)
- `GET /api/leads` - List incoming student leads & counseling requests
- `POST /api/leads` - Submit new admission enquiry
- `DELETE /api/leads/:id` - Remove lead

### 6. Blogs & News (`/api/blog`)
- `GET /api/blog` - Get educational articles & admission updates
- `POST /api/blog` - Create blog post
- `PUT /api/blog/:id` - Edit post
- `DELETE /api/blog/:id` - Delete post

### 7. Admin Dashboard Stats (`/api/dashboard`)
- `GET /api/dashboard/stats` - Summary counters for Colleges, Leads, Courses, Blogs

---

## Database Migration
To generate and run drizzle migrations:
```bash
npm run db:generate
npm run db:migrate
```
