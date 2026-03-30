"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AUTH_DATA } from "../../data/mockData";

const grades = [
  { label: 'Kindergarten', value: 'KG' },
  { label: 'Grade 1', value: '1' },
  { label: 'Grade 2', value: '2' },
  { label: 'Grade 3', value: '3' },
  { label: 'Grade 4', value: '4' },
  { label: 'Grade 5', value: '5' },
  { label: 'Grade 6', value: '6' },
  { label: 'Grade 7', value: '7' },
  { label: 'Grade 8', value: '8' },
  { label: 'Grade 9', value: '9' },
  { label: 'Grade 10', value: '10' },
  { label: 'Grade 11', value: '11' },
  { label: 'Grade 12', value: '12' },
];

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    grade: "KG",
    region: "Addis Ababa",
    acceptTerms: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (otpSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 5) {
      setUsernameValid(null);
      setErrors((prev) => ({ ...prev, username: "" }));
      return;
    }
    setUsernameChecking(true);
    try {
      const data = await api.checkUsername(username.toLowerCase());
      const isValid = !data.exists;
      setUsernameValid(isValid);
      setErrors((prev) => ({ ...prev, username: isValid ? "" : "Username taken" }));
    } catch {
      setErrors((prev) => ({ ...prev, username: "Error checking" }));
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setFormData({ ...formData, username: value });
    if (value.length >= 5) {
      checkUsernameAvailability(value);
    } else {
      setUsernameValid(null);
      setErrors((prev) => ({ ...prev, username: value.length > 0 ? "Min 5 chars" : "" }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 9);
    setFormData({ ...formData, phoneNumber: numericValue });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Required";
    if (!USERNAME_REGEX.test(formData.username)) newErrors.username = "Invalid format";
    else if (usernameValid === false) newErrors.username = "Taken";
    if (!formData.phoneNumber || formData.phoneNumber.length !== 9) newErrors.phone = "9 digits";
    if (!formData.password || formData.password.length < 6) newErrors.password = "Min 6 chars";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mismatch";
    if (!formData.acceptTerms) newErrors.acceptTerms = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    try {
      const fullPhone = `+251${formData.phoneNumber}`;
      await api.sendOTP(fullPhone);
      setOtpSent(true);
      setStep(2);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    setError("");
    try {
      const fullPhone = `+251${formData.phoneNumber}`;
      await api.verifyOTP(fullPhone, otp);
      await api.register({
        fullName: formData.fullName,
        username: formData.username.toLowerCase(),
        password: formData.password,
        phone: fullPhone,
        grade: formData.grade,
        region: formData.region,
        role: "student"
      });
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const fullPhone = `+251${formData.phoneNumber}`;
      await api.sendOTP(fullPhone);
      setTimeLeft(300);
      setOtp("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Tonal Layering Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-container/10 rounded-full blur-[120px]"></div>
        {/* Large Artistic Background Image */}
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
          <div 
            className="w-full h-full opacity-40 mix-blend-multiply grayscale" 
            style={{ backgroundImage: `url('${AUTH_DATA.login.heroImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
          {/* Glass Overlay for the Image */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background"></div>
        </div>
        {/* Watermark MT Motif */}
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
            Elevate <span className="text-primary italic">Learning.</span>
          </h1>
          <p className="text-base text-on-surface-variant max-w-md font-medium">
            Join the digital laboratory of academic excellence.
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">
                  {step === 1 ? "Create Account" : "Verify Phone"}
                </h2>
                <p className="text-sm text-on-surface-variant font-medium">
                  {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                </p>
              </div>
              <div className="flex gap-1">
                <div className={`w-6 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                <div className={`w-4 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-semibold mb-4">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="fullName">Full Name</label>
                    <input 
                      id="fullName" 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Full name" 
                      className={`w-full bg-surface-container-low rounded-lg px-4 py-3 text-base text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/20 ${errors.fullName ? 'ring-1 ring-error' : ''}`}
                    />
                    {errors.fullName && <p className="text-xs text-error font-semibold mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="username">Username</label>
                    <div className="relative">
                      <input 
                        id="username" 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="@username" 
                        className={`w-full bg-surface-container-low rounded-lg px-4 py-3 text-base text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/20 ${errors.username ? 'ring-1 ring-error' : ''}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameChecking && <span className="material-symbols-outlined text-sm text-outline animate-pulse">hourglass_empty</span>}
                        {usernameValid === true && <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>}
                        {usernameValid === false && <span className="material-symbols-outlined text-sm text-error">cancel</span>}
                      </span>
                    </div>
                    {errors.username && <p className="text-xs text-error font-semibold mt-1">{errors.username}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="phone">Phone</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">+251</span>
                      <input 
                        id="phone" 
                        type="tel" 
                        value={formData.phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="9xxxxxxxx" 
                        className={`w-full bg-surface-container-low rounded-lg pl-14 pr-4 py-3 text-base text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/20 ${errors.phone ? 'ring-1 ring-error' : ''}`}
                        maxLength={9}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-error font-semibold mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="grade">Grade</label>
                    <select 
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full bg-surface-container-low rounded-lg px-4 py-3 text-base text-on-surface focus:ring-1 focus:ring-primary/20 appearance-none"
                    >
                      {grades.map((g) => (<option key={g.value} value={g.value}>{g.label}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="region">Region</label>
                    <select 
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full bg-surface-container-low rounded-lg px-4 py-3 text-base text-on-surface focus:ring-1 focus:ring-primary/20 appearance-none"
                    >
                      <option value="Addis Ababa">Addis Ababa</option>
                      <option value="Oromia">Oromia</option>
                      <option value="Amhara">Amhara</option>
                      <option value="SNNPR">SNNPR</option>
                      <option value="Tigray">Tigray</option>
                      <option value="Afar">Afar</option>
                      <option value="Somali">Somali</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="password">Password</label>
                    <div className="relative">
                      <input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Password" 
                        className={`w-full bg-surface-container-low rounded-lg px-4 py-3 text-base text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/20 pr-10 ${errors.password ? 'ring-1 ring-error' : ''}`}
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary" onClick={() => setShowPassword(!showPassword)}>
                        <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-error font-semibold mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="confirmPassword">Confirm</label>
                    <input 
                      id="confirmPassword" 
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm" 
                      className={`w-full bg-surface-container-low rounded-lg px-4 py-3 text-base text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/20 ${errors.confirmPassword ? 'ring-1 ring-error' : ''}`}
                    />
                    {errors.confirmPassword && <p className="text-xs text-error font-semibold mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox"
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="w-4 h-4 rounded border-outline text-primary"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-on-surface-variant">
                    I agree to <span className="text-primary font-semibold">Terms</span> & <span className="text-primary font-semibold">Privacy</span>
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-xs text-error font-semibold">{errors.acceptTerms}</p>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dim text-on-primary font-bold text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-70 mt-2"
                >
                  {loading ? "Sending OTP..." : "Continue to Verification"}
                </button>

                <p className="text-center text-sm font-medium text-on-surface-variant pt-1">
                  Already have an account? <Link href="/login" className="text-primary font-bold">Login</Link>
                </p>
              </form>
            ) : (
              <div className="space-y-5">
                <p className="text-base text-center text-on-surface-variant">
                  Code sent to <span className="text-primary font-bold">+251 {formData.phoneNumber}</span>
                </p>

                <div>
                  <input 
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-surface-container-low rounded-lg px-4 py-4 text-center text-xl tracking-[0.3em] font-bold text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/20"
                    maxLength={6}
                  />
                </div>

                <button 
                  type="button"
                  disabled={otpLoading || otp.length !== 6}
                  onClick={handleVerifyOTP}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dim text-on-primary font-bold text-base rounded-full shadow-lg shadow-primary/20 disabled:opacity-70"
                >
                  {otpLoading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <div className="text-center">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-on-surface-variant">Resend in <span className="font-bold text-primary">{formatTime(timeLeft)}</span></p>
                  ) : (
                    <button type="button" onClick={handleResendOTP} disabled={loading} className="text-sm text-primary font-bold hover:underline">
                      Resend Code
                    </button>
                  )}
                </div>

                <button type="button" onClick={() => { setStep(1); setOtpSent(false); setOtp(""); }} className="w-full py-3 text-sm text-on-surface-variant hover:text-primary">
                  Back to Form
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
