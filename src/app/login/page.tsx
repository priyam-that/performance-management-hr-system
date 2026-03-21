"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { USERS } from "@/lib/auth";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("manager@crystal.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find((u) => u.email === email);
    
    // Hardcoded password verification for prototype
    if (user && password === "password123") {
      Cookies.set("crystal_user", user.email, { expires: 7 }); // 7 days expiration
      router.push(`/${user.role}`);
      router.refresh();
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crystal Group</h1>
          <p className="text-gray-500">Performance Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Hint: Use 'password123'</p>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Accounts:</h3>
          <ul className="text-sm text-gray-500 space-y-2">
            <li>Manager: <code className="bg-gray-100 px-1 rounded">manager@crystal.com</code></li>
            <li>Employee: <code className="bg-gray-100 px-1 rounded">amit.das@crystal.com</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
