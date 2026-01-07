import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./i18n";
import ThemeInit from "./components/common/ThemeInit";
import { ThemeProvider } from "./contexts/ThemeProvider";
import i18next from "i18next";

// Expose a global tf helper for legacy references that expect `tf` in scope.
// This ensures files that call `tf(...)` without importing it don't crash at runtime.
if (typeof window !== "undefined") {
  // keep idempotent
  if (!window.tf) {
    window.tf = (key, options, fallback) => {
      try {
        const translated = i18next.t(key, options);
        if (!translated || translated === key)
          return typeof fallback !== "undefined" ? fallback : key;
        return translated;
      } catch (_e) {
        return typeof fallback !== "undefined" ? fallback : key;
      }
    };
  }
}

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught:", error, errorInfo);
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "50px", fontFamily: "Arial" }}>
          <h1 style={{ color: "#dc2626" }}>App Error</h1>
          <pre
            style={{
              background: "#fee2e2",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log("🚀 Starting app...");

const rootElement = document.getElementById("root");
console.log("✅ Root found:", !!rootElement);

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ThemeInit />
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);

console.log("✅ App mounted");
