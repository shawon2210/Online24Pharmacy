import { useResponsiveTheme } from "../../hooks/useResponsiveTheme";
import { themeClasses } from "../../utils/themeUtils";
import ResponsiveCard from "./ResponsiveCard";
import ResponsiveContainer from "./ResponsiveContainer";
import ResponsiveGrid from "./ResponsiveGrid";

export default function ThemeExampleComponent() {
  const { isDark, isMobile, isTablet } = useResponsiveTheme();

  return (
    <ResponsiveContainer className="py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
            Theme System Example
          </h1>
          <p className={`mt-2 ${themeClasses.text.secondary}`}>
            Current theme:{" "}
            <span className="font-semibold">{isDark ? "Dark" : "Light"}</span>
          </p>
          <p className={`mt-1 ${themeClasses.text.tertiary}`}>
            Device: {isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop"}
          </p>
        </div>

        {/* Cards Grid */}
        <div>
          <h2
            className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}
          >
            Responsive Cards
          </h2>
          <ResponsiveGrid cols={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <ResponsiveCard key={item} hover>
                <div className={`text-center ${themeClasses.text.secondary}`}>
                  <div className="text-3xl font-bold text-emerald-500 mb-2">
                    {item}
                  </div>
                  <p>Card {item}</p>
                </div>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Color Palette */}
        <div>
          <h2
            className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}
          >
            Color Palette
          </h2>
          <ResponsiveGrid cols={2}>
            <ResponsiveCard>
              <div className={`p-4 rounded ${themeClasses.bg.primary}`}>
                <p className={themeClasses.text.primary}>Primary Background</p>
              </div>
            </ResponsiveCard>
            <ResponsiveCard>
              <div className={`p-4 rounded ${themeClasses.bg.secondary}`}>
                <p className={themeClasses.text.secondary}>
                  Secondary Background
                </p>
              </div>
            </ResponsiveCard>
            <ResponsiveCard>
              <div className={`p-4 rounded ${themeClasses.bg.tertiary}`}>
                <p className={themeClasses.text.tertiary}>
                  Tertiary Background
                </p>
              </div>
            </ResponsiveCard>
            <ResponsiveCard>
              <div className={`p-4 rounded ${themeClasses.bg.card}`}>
                <p className={themeClasses.text.primary}>Card Background</p>
              </div>
            </ResponsiveCard>
          </ResponsiveGrid>
        </div>

        {/* Text Styles */}
        <div>
          <h2
            className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}
          >
            Text Styles
          </h2>
          <ResponsiveCard>
            <div className="space-y-3">
              <p className={`text-lg ${themeClasses.text.primary}`}>
                Primary Text
              </p>
              <p className={`text-lg ${themeClasses.text.secondary}`}>
                Secondary Text
              </p>
              <p className={`text-lg ${themeClasses.text.tertiary}`}>
                Tertiary Text
              </p>
              <p className={`text-lg ${themeClasses.text.muted}`}>Muted Text</p>
            </div>
          </ResponsiveCard>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
