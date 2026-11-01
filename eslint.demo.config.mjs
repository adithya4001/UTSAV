import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default [
  ...nextVitals,
  ...nextTs,
  { ignores: ["node_modules/**", "deployment/vercel/dist/**"] },
  {
    files: ["**/*.{ts,tsx,mjs}"],
    rules: {
      // This entry point is a Vite SPA, not a Next router: normal browser navigation is intentional.
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
];
