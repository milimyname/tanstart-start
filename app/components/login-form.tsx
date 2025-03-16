import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { signIn } from "@/app/lib/auth-client";
import { cn } from "@/app/utils";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import * as v from "valibot";

const LoginSchema = v.pipe(
  v.object({
    email: v.pipe(
      v.string(),
      v.nonEmpty("Please enter your email."),
      v.email("The email is badly formatted."),
      v.maxLength(30, "Your email is too long."),
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8, "Your password is too short."),
      v.maxLength(30, "Your password is too long."),
      // v.regex(/[a-z]/, "Your password must contain a lowercase letter."),
      // v.regex(/[A-Z]/, "Your password must contain a uppercase letter."),
      // v.regex(/[0-9]/, "Your password must contain a number."),
    ),
  }),
);

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      await signIn.email(
        {
          email: value.email,
          password: value.password,
          callbackURL: "/", // a url to redirect to after the user verifies their email (optional)
        },
        {
          onSuccess: (ctx) => {
            navigate({ to: "/" });
          },
          onError: (ctx) => {
            // display the error message
            alert(ctx.error.message);
          },
        },
      );
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <form.Field
                  name="email"
                  children={(field) => (
                    <>
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="m@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm font-medium text-destructive">
                          {field.state.meta.errors[0]?.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              <form.Field
                name="password"
                children={(field) => (
                  <>
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm font-medium text-destructive">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </>
                )}
              />
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" className="w-full" disabled={!canSubmit}>
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                )}
              />
              {/* <Button variant="outline" className="w-full">
                Login with Google
              </Button> */}
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
