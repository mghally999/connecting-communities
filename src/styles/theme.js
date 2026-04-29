// Design tokens — driven from the official Figma brand kit colours.
// These match the Figma "Color styles" exactly:
//   Dark blue   #21384F
//   Off-White   #F8FCFF
//   Light Blue  #B0D4E6
//   Orange      #FD542B
//   Grid Dark   #1D2B3A
//   Grid Off    #F1F2F3
//   Grid Light  #A3C6D4

export const theme = {
  colors: {
    navy:          "#21384F",
    navyDeep:      "#1D2B3A",
    orange:        "#FD542B",
    orangeBright:  "#FF6A47",
    skyBlue:       "#B0D4E6",
    skyBlueLight:  "#A3C6D4",
    cream:         "#F8FCFF",
    creamGrey:     "#F1F2F3",
    white:         "#FFFFFF",
    grey:          "#5A6470",
    greyLight:     "#9BA3AB",
    greyBg:        "#E4E7E8",
    rust:          "#D44319",
    black:         "#0B1018",
  },
  fonts: {
    body:    "Manrope, -apple-system, BlinkMacSystemFont, sans-serif",
    heading: "Manrope, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    md: "1.125rem",
    lg: "1.375rem",
    xl: "1.75rem",
    "2xl": "2.25rem",
    "3xl": "3rem",
    "4xl": "4rem",
    "5xl": "5.5rem",
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  radii: {
    none: "0",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "20px",
    pill: "999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(11, 16, 24, 0.06)",
    md: "0 6px 18px rgba(11, 16, 24, 0.08)",
    lg: "0 18px 40px rgba(11, 16, 24, 0.12)",
    xl: "0 30px 60px rgba(11, 16, 24, 0.18)",
  },
  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  transitions: {
    fast:   "200ms cubic-bezier(0.22, 1, 0.36, 1)",
    base:   "320ms cubic-bezier(0.22, 1, 0.36, 1)",
    slow:   "560ms cubic-bezier(0.22, 1, 0.36, 1)",
    bounce: "640ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  layout: {
    maxWidth:     "1440px",
    contentWidth: "1280px",
    headerHeight: "92px",
  },
  zIndex: {
    base: 1,
    raised: 10,
    overlay: 50,
    sticky: 100,
    header: 500,
    modal: 1000,
    toast: 1500,
  },
};
