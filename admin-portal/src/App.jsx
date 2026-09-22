import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Menu, Building2 } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Colleges from "./pages/Colleges";
// import Exams from "./pages/Exams";
import Leads from "./pages/Leads";
import Blogs from "./pages/Blogs";
import Login from "./pages/Login";
import Streams from "./pages/Streams";
import Courses from "./pages/Courses";

// import Placements from "./pages/Placements";
import Reviews from "./pages/Reviews";
import Scholarships from "./pages/Scholarships";

const ProtectedLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-md text-white">
                <Building2 size={16} />
              </div>
              <span className="font-bold text-sm tracking-wide">UniPortal Admin</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-full">
          {children}
        </main>
      </div>
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
        {/* <Route
          path="/exams"
          element={
            <ProtectedLayout>
              <Exams />
            </ProtectedLayout>
          }
        /> */}
        {/* <Route
          path="/placements"
          element={
            <ProtectedLayout>
              <Placements />
            </ProtectedLayout>
          }
        /> */}
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
