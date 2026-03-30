"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const BRAND_BLUE = "#0F4BD7";

interface User {
  username: string;
  phone?: string;
  grade?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getUser();
        setUser(data.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND_BLUE }}>
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="text-xl font-bold" style={{ color: BRAND_BLUE }}>Megatest</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome{user?.username ? `, ${user.username}` : ""}!
        </h1>
        <p className="text-gray-600 mb-8">What would you like to practice today?</p>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Practice Questions",
              desc: "MCQ practice with instant feedback",
              icon: "📝",
              href: "/mcq",
              color: "#0F4BD7"
            },
            {
              title: "Flashcards",
              desc: "Review key concepts with flashcards",
              icon: "🗂️",
              href: "/flashcards",
              color: "#7C3AED"
            },
            {
              title: "Reports",
              desc: "View your progress and statistics",
              icon: "📊",
              href: "/reports",
              color: "#059669"
            }
          ].map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-blue-50">
              <div className="text-2xl font-bold" style={{ color: BRAND_BLUE }}>--</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">--</div>
              <div className="text-sm text-gray-600">Flashcards</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-50">
              <div className="text-2xl font-bold text-green-600">--</div>
              <div className="text-sm text-gray-600">Study Time</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
