import Header from "./Header";
import Footer from "../common/Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-slate-900 text-foreground transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-background"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1 w-full">
        <div className="w-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
