import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  DollarSign,
  CheckSquare,
  Target,
  Menu,
  X,
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Notes",
    href: "/notes",
    icon: FileText,
  },
  {
    name: "Habits",
    href: "/habits",
    icon: TrendingUp,
  },
  {
    name: "Finances",
    href: "/finances",
    icon: DollarSign,
  },
  {
    name: "Checklists",
    href: "/checklists",
    icon: CheckSquare,
  },
  {
    name: "Goals",
    href: "/goals",
    icon: Target,
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">ProductivityHub</h1>
          <div className="flex items-center space-x-2">
            <NotificationCenter />
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-primary bg-blue-50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
