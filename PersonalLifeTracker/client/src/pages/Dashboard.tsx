import { useQuery } from "@tanstack/react-query";
import { FileText, TrendingUp, DollarSign, Target, Plus } from "lucide-react";
import { Link } from "wouter";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalNotes: number;
  habitsCompleted: string;
  monthlyBalance: number;
  goalsProgress: string;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Overview of your productivity metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Notes"
            value={stats?.totalNotes || 0}
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatsCard
            title="Habits Today"
            value={stats?.habitsCompleted || "0/0"}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            title="This Month"
            value={`$${stats?.monthlyBalance?.toFixed(2) || "0.00"}`}
            icon={DollarSign}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
          <StatsCard
            title="Goals Progress"
            value={stats?.goalsProgress || "0/0"}
            icon={Target}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/notes">
                <Button
                  variant="ghost"
                  className="p-4 h-auto bg-blue-50 hover:bg-blue-100 text-left flex flex-col items-start"
                >
                  <Plus className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">New Note</span>
                </Button>
              </Link>
              
              <Link href="/finances">
                <Button
                  variant="ghost"
                  className="p-4 h-auto bg-green-50 hover:bg-green-100 text-left flex flex-col items-start"
                >
                  <Plus className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Add Expense</span>
                </Button>
              </Link>
              
              <Link href="/goals">
                <Button
                  variant="ghost"
                  className="p-4 h-auto bg-purple-50 hover:bg-purple-100 text-left flex flex-col items-start"
                >
                  <Plus className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">New Goal</span>
                </Button>
              </Link>
              
              <Link href="/checklists">
                <Button
                  variant="ghost"
                  className="p-4 h-auto bg-yellow-50 hover:bg-yellow-100 text-left flex flex-col items-start"
                >
                  <Plus className="w-6 h-6 text-yellow-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">New List</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Create your first note</p>
                  <p className="text-xs text-gray-500">Start capturing your thoughts and ideas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Set up daily habits</p>
                  <p className="text-xs text-gray-500">Build positive routines and track progress</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Define your goals</p>
                  <p className="text-xs text-gray-500">Set targets and monitor your achievements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
