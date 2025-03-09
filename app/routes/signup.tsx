import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchUser } from "./__root";
import { SignupForm } from "@/app/components/signup-form";

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    const user = await fetchUser();
    if (user)
      throw redirect({
        to: "/",
      });
    return { user };
  },
  component: SignUpPage,
});

export function SignUpPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
