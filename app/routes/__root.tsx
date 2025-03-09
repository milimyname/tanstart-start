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
    if (location.pathname === "/login" || location.pathname === "/signup") return;

    const user = await fetchUser();

    if (!user) {
      throw redirect({
        to: "/login",
      });
    }

    return { user };
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
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {/* <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider> */}
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
