import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";

import { useRegisterMutation } from "@/api/authApi";
import { AuthLayout } from "@/components/AuthLayout";
import { LoadingButton } from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { applyServerFieldErrors, getApiErrorMessage } from "@/utils/format";

export default function Register() {
  const navigate = useNavigate();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { name: "", email: "", password: "", confirmPassword: "" } });

  async function onSubmit(values) {
    try {
      await registerUser(values).unwrap();
    } catch (error) {
      if (!applyServerFieldErrors(error, setError)) {
        toast.error("Couldn't create account", getApiErrorMessage(error));
      }
      return;
    }

    toast.success("Account created", "Log in to start shopping.");
    navigate("/login", { replace: true });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes a minute. No card needed."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...register("name", {
                required: "Enter your name",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
                maxLength: { value: 50, message: "Name must be 50 characters or fewer" },
              })}
            />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email", {
                required: "Enter your email address",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
              })}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password", {
                required: "Choose a password",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          <Field data-invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword", {
                required: "Re-enter your password",
                validate: (value) => value === getValues("password") || "Passwords do not match",
              })}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
          <LoadingButton type="submit" size="lg" className="w-full" loading={isRegistering}>
            Create account
          </LoadingButton>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
