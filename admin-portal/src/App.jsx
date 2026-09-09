import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Colleges from "./pages/Colleges";
import Exams from "./pages/Exams";
import Leads from "./pages/Leads";
import Blogs from "./pages/Blogs";
import Login from "./pages/Login";
import Streams from "./pages/Streams";
import Courses from "./pages/Courses";

import Placements from "./pages/Placements";
import Reviews from "./pages/Reviews";
import Scholarships from "./pages/Scholarships";


const ProtectedLayout = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/colleges"
          element={
            <ProtectedLayout>
              <Colleges />
            </ProtectedLayout>
          }
        />
        <Route
          path="/streams"
          element={
            <ProtectedLayout>
              <Streams />
            </ProtectedLayout>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedLayout>
              <Courses />
            </ProtectedLayout>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedLayout>
              <Exams />
            </ProtectedLayout>
          }
        />
        <Route
          path="/placements"
          element={
            <ProtectedLayout>
              <Placements />
            </ProtectedLayout>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedLayout>
              <Reviews />
            </ProtectedLayout>
          }
        />
        <Route
          path="/scholarships"
          element={
            <ProtectedLayout>
              <Scholarships />
            </ProtectedLayout>
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedLayout>
              <Leads />
            </ProtectedLayout>
          }
        />
        <Route
          path="/blogs"
          element={
            <ProtectedLayout>
              <Blogs />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
