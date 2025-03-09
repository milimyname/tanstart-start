import { LoginForm } from "@/app/components/login-form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchUser } from "./__root";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    // If user is already logged in, redirect to home
    const user = await fetchUser();
    if (user) {
      throw redirect({
        to: "/",
      });
    }
    return { user };
  },
  component: LoginPage,
});

export function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
