import { cn } from "@/app/utils";
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
import { useForm } from "@tanstack/react-form";
import * as v from "valibot";
import { signUp } from "@/app/lib/auth-client";
import { Link, useNavigate } from "@tanstack/react-router";

const SignUpSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string("Your name must be a string."),
      v.nonEmpty("Please enter your name."),
      v.toMinValue("3"),
    ),
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
    confirmPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "The two passwords do not match.",
    ),
    ["confirmPassword"],
  ),
);

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: SignUpSchema,
    },
    onSubmit: async ({ value }) => {
      await signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: "/", // a url to redirect to after the user verifies their email (optional)
        },
        {
          onRequest: (ctx) => {
            //show loading
          },
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
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create an account to get started</CardDescription>
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
                  name="name"
                  children={(field) => (
                    <>
                      <Label htmlFor={field.name}>Name</Label>
                      <Input
                        id={field.name}
                        type="text"
                        placeholder="John Doe"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        autoComplete="false"
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

              <div className="grid gap-2">
                <form.Field
                  name="password"
                  children={(field) => (
                    <>
                      <Label htmlFor={field.name}>Password</Label>
                      <Input
                        id={field.name}
                        type="password"
                        autoComplete="new-password" // disable password manager
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

              <div className="grid gap-2">
                <form.Field
                  name="confirmPassword"
                  children={(field) => (
                    <>
                      <Label htmlFor={field.name}>Confirm Password</Label>
                      <Input
                        id={field.name}
                        type="password"
                        autoComplete="new-password"
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

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" className="w-full" disabled={!canSubmit}>
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                )}
              />
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
