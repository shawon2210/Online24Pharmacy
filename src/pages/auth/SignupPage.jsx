import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import SEOHead from "../../components/common/SEOHead";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../utils/constants";

const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .regex(
        /^01[3-9]\d{8}$/,
        "Phone number must be 11 digits and start with 01 (e.g., 01712345678)"
      ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
      const signupData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      };
      await signup(signupData);
      toast.success("Account created successfully!");
      navigate(ROUTES.HOME);
    } catch (err) {
      const errorMessage = err.message || "Failed to create account";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <SEOHead
        title={t("signupPage.seoTitle")}
        description={t("signupPage.seoDescription")}
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
            <div className="mx-auto grid w-[400px] gap-6">
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Create an Account</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your information to get started
                </p>
              </div>
              <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="first-name" className="font-semibold">First name</label>
                    <input
                      id="first-name"
                      placeholder="Max"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="last-name" className="font-semibold">Last name</label>
                    <input
                      id="last-name"
                      placeholder="Robinson"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
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
                  <label htmlFor="phone" className="font-semibold">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="01712345678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password"  className="font-semibold">Password</label>
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
                <div className="grid gap-2">
                  <label htmlFor="confirmPassword"  className="font-semibold">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

               