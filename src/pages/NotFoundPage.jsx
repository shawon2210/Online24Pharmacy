import { Link } from "react-router-dom";
import SEOHead from "../components/common/SEOHead";

export default function NotFoundPage() {
  return (
    <>
      <SEOHead title="404 - Page Not Found - Online24 Pharmacy" />
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl font-extrabold text-primary/20 mb-4">404</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base">
            Sorry, the page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
