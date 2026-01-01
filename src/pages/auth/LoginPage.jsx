import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import SEOHead from '../../components/common/SEOHead';
import { ROUTES } from '../../utils/constants';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, BoltIcon, TruckIcon } from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  remember: z.boolean().optional(),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      toast.success('Welcome back!');
      setTimeout(() => navigate(result.user.role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME, { replace: true }), 100);
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Login - Online24 Pharmacy" description="Access your medicine orders" />
      <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-emerald-600 via-blue-700 to-purple-900 p-8 xl:p-12 flex-col justify-between relative z-10 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)]" />
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <span className="text-2xl">💊</span>
            </div>
            <span className="text-2xl font-bold text-white">Online24</span>
          </Link>
          <div className="space-y-6 relative z-10">
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight animate-fade-in drop-shadow-lg">Welcome<br/>Back</h1>
            <p className="text-xl text-emerald-100 animate-fade-in-delay font-medium">Access your medicine orders 24/7</p>
            <div className="space-y-4 pt-8">
              <div className="flex items-center gap-4 text-white transform hover:translate-x-2 transition-all duration-300 group cursor-pointer">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg group-hover:shadow-xl">
                  <BoltIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-white font-semibold block">Fast Delivery</span>
                  <span className="text-emerald-200 text-sm">Within 2-24 hours</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white transform hover:translate-x-2 transition-all duration-300 group cursor-pointer">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg group-hover:shadow-xl">
                  <ShieldCheckIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-white font-semibold block">Trusted Platform</span>
                  <span className="text-emerald-200 text-sm">10K+ happy customers</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white transform hover:translate-x-2 transition-all duration-300 group cursor-pointer">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg group-hover:shadow-xl">
                  <TruckIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-white font-semibold block">Free Shipping</span>
                  <span className="text-emerald-200 text-sm">All over Dhaka</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-emerald-100 text-sm relative z-10 flex items-center gap-2">
            <span className="text-lg">🇧🇩</span> Serving Dhaka with care since 2024
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-8 group">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <span className="text-3xl">💊</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Online24</span>
            </Link>

            <div className="bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-800/50 transform hover:scale-[1.01] transition-all duration-300">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">Sign In</h2>
                <p className="text-gray-400 font-medium">Welcome back! Please enter your details</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 bg-gray-800/50 border-2 border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-base text-gray-100 placeholder-gray-500 group-hover:border-gray-600"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-2 flex items-center gap-1 font-medium"><span>⚠</span>{errors.email.message}</p>}
                </div>

                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-sm font-bold text-gray-300">Password</label>
                    <Link to="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 font-bold transition-colors">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 pr-12 bg-gray-800/50 border-2 border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-base text-gray-100 placeholder-gray-500 group-hover:border-gray-600"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors p-1"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 mt-2 flex items-center gap-1 font-medium"><span>⚠</span>{errors.password.message}</p>}
                </div>

                <div className="flex items-center">
                  <input id="remember" type="checkbox" className="w-4 h-4 text-emerald-500 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500 transition-all" {...register('remember')} />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-300 font-semibold">Remember me for 30 days</label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-500 hover:via-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 text-base"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400 font-medium">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-300 hover:to-blue-300 transition-all">Sign Up →</Link>
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
