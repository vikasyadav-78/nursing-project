import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  UserPlus,
  Newspaper,
  FileCheck,
  Loader2,
} from "lucide-react";
import API from "../api/client";

const Dashboard = () => {
  const [stats, setStats] = useState({
    colleges: 0,
    leads: 0,
    blogs: 0,
    courses: 0,
    exams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/dashboard/stats");
      if (res.data?.success) {
        setStats((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
        <p className="text-slate-500 text-sm">Loading dashboard stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of Colleges, Courses, Exams, and Student Admission Leads.
        </p>
      </div>

      {/* Simple Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Colleges"
          value={stats.colleges}
          icon={<GraduationCap size={20} className="text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Admission Leads"
          value={stats.leads}
          icon={<UserPlus size={20} className="text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Active Courses"
          value={stats.courses}
          icon={<BookOpen size={20} className="text-purple-600" />}
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Entrance Exams"
          value={stats.exams}
          icon={<FileCheck size={20} className="text-amber-600" />}
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Blogs & News"
          value={stats.blogs}
          icon={<Newspaper size={20} className="text-rose-600" />}
          bgColor="bg-rose-50"
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
    <div className={`p-3 ${bgColor} rounded-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {title}
      </p>
      <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
        {value.toLocaleString()}
      </h3>
    </div>
  </div>
);

export default Dashboard;
