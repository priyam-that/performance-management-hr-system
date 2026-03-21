"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut } from "lucide-react";
import { User } from "@/lib/auth";

export default function Header({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("crystal_user");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">Crystal Group</h1>
            <span className="ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {user.role} Portal
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 font-medium">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
