import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from 'react-hot-toast';
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
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isUnauthorized = searchParams.get("redirect") === "unauthorized";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await login(data.email, data.password);
      toast.success('Login successful!');
      
      const redirectPath = result.user.role === "ADMIN" 
        ? ROUTES.ADMIN_DASHBOARD 
        : ROUTES.HOME;
      
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
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

      <div className="min-h-screen flex bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="max-w-md w-full">
            <div className="card">
              <h2 className="text-center font-black text-2xl md:text-3xl text-emerald-600 mb-6">
                {t("loginPage.title")}
              </h2>

              {(isUnauthorized || error) && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700">
                    {error || t("loginPage.unauthorized")}
                  </p>
                </div>
              )}

              <form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-row">
                  <label className="form-label">
                    {t("loginPage.emailLabel")}
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder={t("loginPage.emailPlaceholder")}
                    className="input-field"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 ml-2">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="form-row">
                  <label className="form-label">
                    {t("loginPage.passwordLabel")}
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    placeholder={t("loginPage.passwordPlaceholder")}
                    className="input-field"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 ml-2">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="mt-2">
                  <Link
                    to="#"
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    {t("loginPage.forgotPassword")}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary mt-5"
                >
                  {isLoading
                    ? t("loginPage.signingInButton")
                    : t("loginPage.signInButton")}
                </button>

                <div className="mt-6">
                  <span className="block text-center text-[10px] text-[#aaa]">
                    Or Sign in with
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
                  {t("loginPage.noAccount")}{" "}
                  <Link
                    to="/signup"
                    className="text-[#0099ff] font-semibold hover:underline"
                  >
                    {t("loginPage.signUpLink")}
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
