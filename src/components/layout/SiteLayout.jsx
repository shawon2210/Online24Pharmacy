import Header from "./Header";
import FloatingSidebar from "./FloatingSidebar";

export default function SiteLayout({ children }) {
  return (
    <div className="antialiased bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Header />
      {/* Sidebar overlays on mobile, fixed on desktop */}
      <div className="relative flex">
        <FloatingSidebar />
        <main
          className="flex-1 w-full transition-all duration-300 pl-0 md:pl-64 min-h-screen"
          style={{ minHeight: "100vh", position: "relative", zIndex: 0 }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
