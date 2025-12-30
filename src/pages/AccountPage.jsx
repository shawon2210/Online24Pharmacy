import { useState, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuthStore } from "../stores/authStore";
import SEOHead from "../components/common/SEOHead";
import {
  UserCircleIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  MapPinIcon,
  CogIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function AccountPage() {
  const { t } = useTranslation();
  const [headerOffset, setHeaderOffset] = useState(0);
  const contextAuth = useAuth();
  const storeAuth = useAuthStore();
  const user = contextAuth.user || storeAuth.user;

  useLayoutEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;
    const compute = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      setHeaderOffset(h);
    };
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  if (!user) {
    return (
      <>
        <SEOHead title={t('accountPage.seoTitle')} />
        <div
          className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
          style={{ paddingTop: `${headerOffset}px` }}
        >
          <div className="max-w-md mx-auto text-center">
            <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-6">
              {t('accountPage.loginPrompt')}
            </p>
            <Link
              to="/login"
              className="inline-block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700"
            >
              {t('signIn')}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const accountSections = [
    {
      title: t('accountPage.profileTitle'),
      description: t('accountPage.profileDesc'),
      icon: UserCircleIcon,
      link: "/profile",
      color: "from-emerald-500 to-green-500",
    },
    {
      title: t('accountPage.ordersTitle'),
      description: t('accountPage.ordersDesc'),
      icon: ShoppingBagIcon,
      link: "/my-orders",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: t('accountPage.prescriptionsTitle'),
      description: t('accountPage.prescriptionsDesc'),
      icon: DocumentTextIcon,
      link: "/my-prescriptions",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: t('accountPage.addressesTitle'),
      description: t('accountPage.addressesDesc'),
      icon: MapPinIcon,
      link: "/profile",
      color: "from-orange-500 to-red-500",
    },
    {
      title: t('accountPage.wishlistTitle'),
      description: t('accountPage.wishlistDesc'),
      icon: HeartIcon,
      link: "/wishlist",
      color: "from-rose-500 to-pink-500",
    },
    {
      title: t('accountPage.settingsTitle'),
      description: t('accountPage.settingsDesc'),
      icon: CogIcon,
      link: "/profile",
      color: "from-gray-500 to-slate-500",
    },
  ];

  return (
    <>
      <SEOHead title={t('accountPage.seoTitle')} />
      <div
        className="w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-12 sm:pb-16 lg:pb-20"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 1.5rem)`,
          minHeight: "100vh",
        }}
      >
        <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                <span className="text-lg sm:text-xl">👤</span>
                <span>{t('accountPage.myAccount')}</span>
              </span>
            </div>
            <h1 className="font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-2 sm:mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {t('accountPage.welcome', { name: user.firstName })}
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              {t('accountPage.manageAccount')}
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 text-white">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <UserCircleIcon className="w-10 sm:w-12 h-10 sm:h-12 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-black mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-emerald-100 text-sm truncate">{user.email}</p>
                {user.phone && (
                  <p className="text-emerald-100 text-sm">{user.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Sections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {accountSections.map((section) => (
              <Link
                key={section.title}
                to={section.link}
                className="group bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600">{section.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
