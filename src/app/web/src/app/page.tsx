"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const BRAND_BLUE = "#0F4BD7";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BRAND_BLUE }}>
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
          <Link 
            href="/dashboard"
            className="px-6 py-3 rounded-lg text-white font-semibold inline-block"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F4BD7" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: BRAND_BLUE }}>M</span>
          </div>
          <span className="text-xl font-bold text-white">Megatest</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login"
            className="px-4 py-2 text-white font-medium hover:opacity-90"
          >
            Log In
          </Link>
          <Link 
            href="/signup"
            className="px-5 py-2 rounded-lg bg-white font-semibold hover:opacity-90 transition-opacity"
            style={{ color: BRAND_BLUE }}
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Master Your Studies<br />with Confidence
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Practice with thousands of questions, track your progress, and achieve your academic goals with Megatest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="px-8 py-4 rounded-xl bg-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
              style={{ color: BRAND_BLUE }}
            >
              Get Started Free
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "📚",
              title: "Comprehensive Subjects",
              desc: "Access questions across multiple subjects and grades"
            },
            {
              icon: "📊",
              title: "Track Progress",
              desc: "Monitor your performance and identify areas to improve"
            },
            {
              icon: "🎯",
              title: "National Exams",
              desc: "Practice with past national exam questions"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} Megatest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
