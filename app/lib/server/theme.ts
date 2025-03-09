import { createServerFn } from "@tanstack/react-start";
import { getWebRequest, getContext, getCookie } from "@tanstack/react-start/server";

export type Company = "acme-light" | "acme-dark";

const companyThemes: Record<string, Company> = {
  "acme-light": "acme-light",
  "acme-dark": "acme-dark",
  // Add more companies as needed
};

function getCompanyFromHostname(hostname: string): string | null {
  const subdomain = hostname.split(".")[0];

  if (subdomain === "localhost" || hostname === "yourapp.com") return null;

  return subdomain;
}

export const getServerTheme = createServerFn({ method: "GET" }).handler(async () => {
  const request = getWebRequest();

  if (!request) return "system";

  const hostname = request.headers.get("host") || "";

  // 1. Get company from hostname
  const company = getCompanyFromHostname(hostname);

  if (company && companyThemes[company]) return companyThemes[company];

  // 2. Check for a theme cookie
  const themeCookie = getCookie("tanstack-ui-theme");
  console.log("themeCookie", themeCookie);
  if (themeCookie) return themeCookie;

  return "system";
});
