/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      headerbg: "#3D4C59",
      headerheading: "#ffffff",
      templatebg: "#ffffff",
      templatehistory: "#019F74",
      templatehistorytext: "#ffffff",
      templateoption: "rgb(173, 173, 173)",
      templatenotify: "#E35C44",
      templateborder: "#ced4da",
      downloadbtnbg: "#10806F",
      footerbg: "#DFE3E8",
      footerheading: "#5E6A73",
      footerpara: "#3D4C59",
      invoicebg: "#e9ecef",

      white: "#ffffff",
      gray: "#ced4da",
    },
  },
  plugins: [],
};
