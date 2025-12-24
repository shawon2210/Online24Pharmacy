import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import SEOHead from "../../components/common/SEOHead";
import { ROUTES } from "../../utils/constants";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await login(data.email, data.password);
      toast.success("Login successful!");

      const redirectPath =
        result.user.role === "ADMIN" ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME;

      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={t("loginPage.seoTitle")}
        description={t("loginPage.seoDescription")}
      />

      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl lg:grid lg:grid-cols-2 rounded-lg shadow-lg overflow-hidden bg-white mt-[-5%]">
          <div className="hidden lg:block">
            <img
              src="/online24pharmacy-logo.png"
              alt="Image"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="mx-auto grid w-[350px] gap-6">
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Welcome Back</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your credentials to access your account
                </p>
              </div>
              <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                  <label htmlFor="email" className="font-semibold">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <label htmlFor="password"  className="font-semibold">Password</label>
                    <Link
                      to="/forgot-password"
                      className="ml-auto inline-block text-sm text-blue-600 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  variant="outline"
                  disabled={isLoading}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-5 h-5" />
                  Login with Google
                </button>
              </form>
              <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
