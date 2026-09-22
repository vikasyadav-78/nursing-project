import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  UserPlus,
  Newspaper,
  LogOut,
  Building2,
  Layers,
  Star,
  Award,
  X,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Colleges", path: "/colleges", icon: <GraduationCap size={18} /> },
    { label: "Streams", path: "/streams", icon: <Layers size={18} /> },
    { label: "Courses", path: "/courses", icon: <BookOpen size={18} /> },
    // { label: "Entrance Exams", path: "/exams", icon: <FileCheck size={18} /> },
    // { label: "Placements", path: "/placements", icon: <TrendingUp size={18} /> },
    { label: "Reviews", path: "/reviews", icon: <Star size={18} /> },
    { label: "Scholarships", path: "/scholarships", icon: <Award size={18} /> },
    { label: "Student Leads", path: "/leads", icon: <UserPlus size={18} /> },
    { label: "Blogs & News", path: "/blogs", icon: <Newspaper size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col justify-between p-4 flex-shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Header Brand */}
          <div className="flex items-center justify-between px-3 py-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">UniPortal</h2>
                <p className="text-xs text-slate-400 font-medium">Admin Panel</p>
              </div>
            </div>
            {/* Close Button on Mobile */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Logout */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 font-medium transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
