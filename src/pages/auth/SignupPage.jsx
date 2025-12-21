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
  const [error, setError] = useState("");

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
      setError("");
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
      setError(errorMessage);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
        <div className="w-full flex justify-center items-center">
          <div className="max-w-md w-full flex flex-col items-center justify-center">
            <div className="bg-gradient-to-b from-white to-[#F4F7FB] rounded-[40px] shadow-[rgba(133,189,215,0.878)_0px_30px_30px_-20px] p-8 border-[5px] border-white w-full flex flex-col items-center">
              <h2 className="text-center text-3xl font-black text-[#1089D3] mb-6">
                {t("signupPage.title")}
              </h2>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4 w-full">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <form className="mt-5 w-full" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      {...register("firstName")}
                      placeholder={t("signupPage.firstNamePlaceholder")}
                      className="w-full bg-white border-none px-4 py-3 rounded-[20px] shadow-[#cff0ff_0px_10px_10px_-5px] border-2 border-transparent focus:outline-none focus:border-[#12B1D1] transition-all text-sm"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register("lastName")}
                      placeholder={t("signupPage.lastNamePlaceholder")}
                      className="w-full bg-white border-none px-4 py-3 rounded-[20px] shadow-[#cff0ff_0px_10px_10px_-5px] border-2 border-transparent focus:outline-none focus:border-[#12B1D1] transition-all text-sm"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder={t("signupPage.emailPlaceholder")}
                  className="w-full bg-white border-none px-5 py-4 rounded-[20px] mt-3 shadow-[#cff0ff_0px_10px_10px_-5px] border-2 border-transparent focus:outline-none focus:border-[#12B1D1] transition-all"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 ml-2">
                    {errors.email.message}
                  </p>
                )}
                <input
                  {...register("phone")}
                  placeholder={t("signupPage.phonePlaceholder")}
                  className="w-full bg-white border-none px-5 py-4 rounded-[20px] mt-3 shadow-[#cff0ff_0px_10px_10px_-5px] border-2 border-transparent focus:outline-none focus:border-[#12B1D1] transition-all"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 ml-2">
                    {errors.phone.message}
                  </p>
                )}
                <input
                  {...register("password")}
                  type="password"
                  placeholder={t("signupPage.passwordPlaceholder")}
                  className="w-full bg-white border-none px-5 py-4 rounded-[20px] mt-3 shadow-[#cff0ff_0px_10px_10px_-5px] border-2 border-transparent focus:outline-none focus:border-[#12B1D1] transition-all"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 ml-2">
                    {errors.password.message}
                  </p>
                )}
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder={t("signupPage.confirmPasswordPlaceholder")}
                  className="w-full bg-white border-none px-5 py-4 rounded-[20px] mt-3 shadow-[#cff0ff_0px_10px_10px_-5px] border-2 border-transparent focus:outline-none focus:border-[#12B1D1] transition-all"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 ml-2">
                    {errors.confirmPassword.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-bold bg-gradient-to-r from-[#1089D3] to-[#12B1D1] text-white py-4 mt-5 rounded-[20px] shadow-[rgba(133,189,215,0.878)_0px_20px_10px_-15px] border-none transition-all duration-200 hover:scale-[1.03] hover:shadow-[rgba(133,189,215,0.878)_0px_23px_10px_-20px] active:scale-95 active:shadow-[rgba(133,189,215,0.878)_0px_15px_10px_-10px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? t("signupPage.creatingAccountButton")
                    : t("signupPage.createAccountButton")}
                </button>
                <div className="mt-6">
                  <span className="block text-center text-[10px] text-[#aaa]">
                    Or Sign up with
                  </span>
                  <div className="flex justify-center gap-4 mt-2">
                    <button
                      type="button"
                      className="bg-gradient-to-r from-black to-[#707070] border-[5px] border-white p-1.5 rounded-full w-10 h-10 flex items-center justify-center shadow-[rgba(133,189,215,0.878)_0px_12px_10px_-8px] transition-all duration-200 hover:scale-110 active:scale-90"
                    >
                      <svg
                        className="fill-white w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                      >
                        <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="bg-gradient-to-r from-black to-[#707070] border-[5px] border-white p-1.5 rounded-full w-10 h-10 flex items-center justify-center shadow-[rgba(133,189,215,0.878)_0px_12px_10px_-8px] transition-all duration-200 hover:scale-110 active:scale-90"
                    >
                      <svg
                        className="fill-white w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                      >
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="bg-gradient-to-r from-black to-[#707070] border-[5px] border-white p-1.5 rounded-full w-10 h-10 flex items-center justify-center shadow-[rgba(133,189,215,0.878)_0px_12px_10px_-8px] transition-all duration-200 hover:scale-110 active:scale-90"
                    >
                      <svg
                        className="fill-white w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-center mt-4 text-base text-gray-600">
                  {t("signupPage.haveAccount")}{" "}
                  <Link
                    to="/login"
                    className="text-[#0099ff] font-semibold hover:underline"
                  >
                    {t("signupPage.signInLink")}
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
