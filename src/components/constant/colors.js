export const THEME_COLORS = {
  // Primary colors - brand green theme
  primary: {
    50: "bg-brand-50",
    100: "bg-brand-100",
    200: "bg-brand-200",
    500: "bg-brand-500",
    600: "bg-brand-600",
    700: "bg-brand-700",
    800: "bg-brand-800",
  },
  // Text colors
  text: {
    primary50: "text-brand-50",
    primary100: "text-brand-100",
    primary200: "text-brand-200",
    primary600: "text-brand-600",
    primary700: "text-brand-700",
    
  },
  // Border colors
  border: {
    primary200: "border-brand-200/30",
    primary500: "border-brand-500",
  },
  // Hover colors
  hover: {
    primary100: "hover:bg-brand-600/20",
    primary500: "hover:bg-brand-500",
    primary700: "hover:bg-brand-700",
  },
  // Background colors
  background: {
    primary: "bg-gradient-to-br from-brand-50 via-white to-brand-50",
    secondary: "bg-gradient-to-r from-brand-50 to-brand-100",
    card: "bg-white",
    muted: "bg-brand-50",
    accent: "bg-brand-50",
  },
}

// CSS custom properties for dynamic colors
export const CSS_COLORS = {
  primary: "#16a34a",          // brand-600 (green)
  primaryDark: "#052e16",      // brand-950 (deep green)
  primaryLight: "#22c55e",     // brand-500
  primaryVeryLight: "#bbf7d0", // brand-200
  primaryExtraLight: "#f0fdf4",// brand-50

  // Background colors
  background: {
    primary: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)", // brand-50 to brand-100
    secondary: "linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%)", // brand-50 to brand-100
    card: "#ffffff",           // white card
    muted: "#f0fdf4",          // brand-50
    accent: "#dcfce7",         // brand-100
    overlay: "rgba(22, 163, 74, 0.03)", // brand-600 with 3% opacity
    sidebar: "linear-gradient(180deg, #052e16 0%, #0a1a0f 40%, #071a0c 100%)",
    activeSidebar: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",

  },



}
