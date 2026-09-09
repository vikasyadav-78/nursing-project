import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import collegeRoutes from "./routes/college.route.js";
import courseRoutes from "./routes/course.route.js";
import blogRoutes from "./routes/blog.route.js";
import path from "path";
import leadRoutes from "./routes/lead.route.js";
import auditRoutes from "./routes/audit.routes.js";
import indiaRoutes from "./routes/india.routes.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import examRoutes from "./routes/exam.route.js";
import streamRoutes from "./routes/stream.route.js";
import searchRoutes from "./routes/search.route.js";
import universityRoutes from "./routes/university.route.js";
import placementRoutes from "./routes/placement.route.js";
import reviewRoutes from "./routes/review.route.js";
import scholarshipRoutes from "./routes/scholarship.route.js";
import activityRoutes from "./routes/activity.route.js";

const app = express();

// HEALTH
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// ---------- MIDDLEWARE ----------
app.use(cors({ origin: true, credentials: true }));
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: false, 
  })
);

//    API
app.use('/api/auth', authRoutes); 
app.use('/api/user', userRoutes); 
app.use("/api/college", collegeRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/college/india", indiaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/university", universityRoutes);
app.use("/api/placement", placementRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/scholarship", scholarshipRoutes);
app.use("/api/activity", activityRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "/uploads")));

export default app;