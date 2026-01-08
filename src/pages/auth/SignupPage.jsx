import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import SEOHead from "../../components/common/SEOHead";
import { ROUTES } from "../../utils/constants";
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  BoltIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const signupSchema = z
  .object({
    firstName: z.string().min(2, "Min 2 characters"),
    lastName: z.string().min(2, "Min 2 characters"),
    email: z.string().email("Invalid email"),
    phone: z.string().regex(/^01[3-9]\d{8}$/, "Format: 01XXXXXXXXX"),
    password: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      toast.success("Account created!");
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Sign Up - Online24 Pharmacy"
        description="Join Online24 Pharmacy"
      />
      <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-950 to-black">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-40 left-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 right-20 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero */}
        <div className="hidden lg:flex lg:w-2/5 bg-linear-to-br from-blue-600 via-purple-700 to-emerald-900 p-8 xl:p-12 flex-col justify-between relative z-10 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.08),transparent)]" />
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <span className="text-2xl">💊</span>
            </div>
            <span className="text-2xl font-bold text-background">Online24</span>
          </Link>
          <div className="space-y-6 relative z-10">
            <h1 className="text-5xl xl:text-6xl font-extrabold text-background leading-tight animate-fade-in drop-shadow-lg">
              Join Our
              <br />
              Community
            </h1>
            <p className="text-xl text-blue-100 animate-fade-in-delay font-medium">
              Fast medicine delivery in Dhaka
            </p>
            <div className="space-y-4 pt-8">
              <div className="flex items-center gap-4 text-background transform hover:translate-x-2 transition-all duration-300 group cursor-pointer">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg group-hover:shadow-xl">
                  <BoltIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-background font-semibold block">
                    Lightning Fast
                  </span>
                  <span className="text-blue-200 text-sm">
                    2-24 hour delivery
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-background transform hover:translate-x-2 transition-all duration-300 group cursor-pointer">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg group-hover:shadow-xl">
                  <CheckCircleIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-background font-semibold block">
                    Verified Quality
                  </span>
                  <span className="text-blue-200 text-sm">
                    10K+ satisfied customers
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-background transform hover:translate-x-2 transition-all duration-300 group cursor-pointer">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg group-hover:shadow-xl">
                  <ShieldCheckIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-background font-semibold block">
                    Secure & Safe
                  </span>
                  <span className="text-blue-200 text-sm">
                    Your data is protected
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-blue-100 text-sm relative z-10 flex items-center gap-2">
            © 2024 Online24 Pharmacy. All rights reserved.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 lg:p-8 pt-8 sm:pt-6 relative z-10">
          <div className="w-full max-w-lg">
            <Link
              to="/"
              className="lg:hidden flex items-center justify-center gap-3 mb-8 group"
            >
              <div className="w-14 h-14 bg-linear-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <span className="text-2xl">💊</span>
              </div>
              <span className="text-2xl font-bold bg-linear-to-br from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Online24
              </span>
            </Link>

            <div className="bg-card/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-card/50 transform hover:scale-[1.01] transition-all duration-300">
              <div className="text-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-br from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-3">
                  Create Account
                </h2>
                <p className="text-muted-foreground text-sm font-medium">
                  Join thousands of happy customers
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-bold text-muted mb-2"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      className="w-full px-3 py-3 bg-card/50 border-2 border-foreground rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-base text-background placeholder-gray-500 group-hover:border-muted-foreground"
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-400 mt-1.5 font-medium">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="group">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-bold text-muted mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      className="w-full px-3 py-3 bg-card/50 border-2 border-foreground rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-base text-background placeholder-gray-500 group-hover:border-muted-foreground"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-400 mt-1.5 font-medium">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-muted mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-card/50 border-2 border-foreground rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-base text-background placeholder-gray-500 group-hover:border-muted-foreground"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1.5 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-bold text-muted mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                      +88
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="01712345678"
                      className="w-full pl-14 pr-4 py-3 bg-card/50 border-2 border-foreground rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-base text-background placeholder-gray-500 group-hover:border-muted-foreground"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-400 mt-1.5 font-medium">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-muted mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 bg-card/50 border-2 border-foreground rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-base text-background placeholder-gray-500 group-hover:border-muted-foreground"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1.5 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold text-muted mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 bg-card/50 border-2 border-foreground rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-base text-background placeholder-gray-500 group-hover:border-muted-foreground"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted transition-colors p-1"
                    >
                      {showConfirm ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1.5 font-medium">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 mt-1 text-emerald-500 bg-card border-muted-foreground rounded focus:ring-emerald-500 transition-all"
                    {...register("terms")}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted font-medium"
                  >
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                    >
                      Privacy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-xs text-red-400 font-medium">
                    {errors.terms.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-linear-to-br from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-500 hover:via-purple-500 hover:to-emerald-500 text-background font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 text-base mt-6"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-transparent bg-clip-text bg-linear-to-br from-blue-400 to-emerald-400 hover:from-blue-300 hover:to-emerald-300 transition-all"
                  >
                    Sign In →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-delay { animation: fade-in 0.6s ease-out 0.2s both; }
      `}</style>
    </>
  );
}
