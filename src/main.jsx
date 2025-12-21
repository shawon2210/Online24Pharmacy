import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./utils/i18n";
import ThemeInit from "./components/common/ThemeInit";

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

if (import.meta.hot) {
  import.meta.hot.accept();
}

console.log("🚀 Starting app...");

const rootElement = document.getElementById("root");
console.log("✅ Root found:", !!rootElement);

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeInit />
      <App />
    </ErrorBoundary>
  </StrictMode>
);

console.log("✅ App mounted");
