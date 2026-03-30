"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AUTH_DATA } from "../../data/mockData";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Registration successful! Please login with your credentials.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.login(username, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-container/10 rounded-full blur-[120px]"></div>
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
          <div 
            className="w-full h-full opacity-40 mix-blend-multiply grayscale" 
            style={{ backgroundImage: `url('${AUTH_DATA.login.heroImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background"></div>
        </div>
        <div className="absolute bottom-12 left-12 opacity-[0.03] select-none text-[20rem] font-headline font-black leading-none tracking-tighter">
          MT
        </div>
      </div>

      <main className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row gap-8 items-start">
        <div className="hidden md:block w-full md:w-1/2 pt-8 space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-full shadow-sm border border-outline-variant/10">
            <div className="w-6 h-6 rounded-md overflow-hidden">
              <img src="/logo.png" alt="MegaTest" className="w-full h-full object-contain" />
            </div>
            <span className="text-primary font-black tracking-tighter text-lg font-headline">MegaTest</span>
          </Link>
          <h1 className="text-5xl md:text-6xl font-headline font-bold text-on-surface leading-[0.9] tracking-tighter">
            Welcome <span className="text-primary italic">Back.</span>
          </h1>
          <p className="text-base text-on-surface-variant max-w-md font-medium">
            Secure access to your research laboratory and academic resources.
          </p>
          <div className="flex gap-12 pt-4">
            <div>
              <div className="text-3xl font-headline font-bold text-primary">{AUTH_DATA.signup.stats.scholars}</div>
              <div className="text-sm font-semibold text-on-surface-variant">Scholars</div>
            </div>
            <div>
              <div className="text-3xl font-headline font-bold text-primary">{AUTH_DATA.signup.stats.passRate}</div>
              <div className="text-sm font-semibold text-on-surface-variant">Pass Rate</div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-2xl border border-white/40">
            <div className="mb-6">
              <h2 className="text-2xl font-headline font-bold text-on-surface">
                Sign In
              </h2>
              <p className="text-sm text-on-surface-variant font-medium">
                Access your account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="identity">Username or Email</label>
                <input 
                  id="identity" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username or email" 
                  className="w-full bg-surface-container-low rounded-lg px-4 py-3 text-base text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="password">Password</label>
                  <button type="button" className="text-xs font-bold text-primary hover:text-primary-dim">Forgot?</button>
                </div>
                <div className="relative">
                  <input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••" 
                    className="w-full bg-surface-container-low rounded-lg px-4 py-3 text-base text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/20 pr-10"
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dim text-on-primary font-bold text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-70"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <p className="text-center text-sm font-medium text-on-surface-variant pt-1">
                New to the vanguard? <Link href="/signup" className="text-primary font-bold">Create an account</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
