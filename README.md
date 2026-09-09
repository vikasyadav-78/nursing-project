# Nursing Educational Directory Platform

This workspace contains the complete **Backend REST APIs** and dedicated **Admin Portal** UI designed and customized following the **GetMyUni** educational directory portal model.

## Folder Structure

```
Nursing/
├── Backend/        # Express.js + Drizzle ORM REST APIs
└── admin-portal/   # React + Vite Admin Control Panel (Tailwind CSS, Lucide Icons)
```

---

## 1. Backend Server (`/Backend`)

Contains all REST endpoints for managing Colleges, Courses, Entrance Exam alerts, Student Enquiries, and Blog posts.

### Setup & Execution
```bash
cd Backend
npm install
npm run dev
```
Runs on: `http://localhost:5000`

---

## 2. Admin Portal (`/admin-portal`)

Customized modern Admin Control Panel to manage institutional data, admission leads, entrance exam alerts, and dashboard analytics.

### Setup & Execution
```bash
cd admin-portal
npm install
npm run dev
```
Runs on: `http://localhost:5173`

---

## Key Admin Modules Included:
1. **Dashboard Overview**: Live stats for Colleges, Leads, Exams, Courses, and Blogs.
2. **College Management**: Institutional directory with filterable search and CRUD operations.
3. **Entrance Exams & Alerts**: Manage NEET, NNET, AIIMS, State & University entrance exam schedules.
4. **Student Admission Leads**: Real-time tracking of student counselling inquiries.
5. **Admin Session Auth**: Login page with JWT/Session cookie support.