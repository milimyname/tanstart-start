/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AppSidebar } from "@/app/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/app/components/ui/sidebar";
//@ts-expect-error
import appCss from "@/app/styles/app.css?url";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@/app/lib/server/auth";
import { NotFound } from "@/app/components/not-found";
import { DefaultCatchBoundary } from "@/app/components/deafult-catch-boundry";
import { getWebRequest } from "@tanstack/react-start/server";
import { ThemeProvider } from "@/app/components/theme-provider";
import { getServerTheme } from "@/app/lib/server/theme";

export const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  const request = getWebRequest();

  if (!request) return null;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user || null;
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  beforeLoad: async ({ location }) => {
    const theme = await getServerTheme();

    console.log("beforeLoad 1", { theme });

    if (location.pathname === "/login" || location.pathname === "/signup")
      return { theme };

    const user = await fetchUser();

    if (!user) {
      throw redirect({
        to: "/login",
      });
    }

    console.log("beforeLoad 2", { theme });

    return { user, theme };
  },
  notFoundComponent: () => <NotFound />,
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { theme } = Route.useRouteContext();

  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme={theme as any}>
          {/* <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider> */}
          {children}
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
