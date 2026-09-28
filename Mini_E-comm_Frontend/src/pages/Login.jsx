import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import { useLoginMutation } from "@/api/authApi";
import { setCredentials } from "@/features/auth/authSlice";
import { AuthLayout } from "@/components/AuthLayout";
import { LoadingButton } from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { applyServerFieldErrors, getApiErrorMessage } from "@/utils/format";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { email: "", password: "" } });

  async function onSubmit(values) {
    try {
      const res = await login(values).unwrap();
      dispatch(setCredentials(res.data));
      toast.success("Welcome back", res.data.user.name);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      if (!applyServerFieldErrors(error, setError)) {
        toast.error("Couldn't log in", getApiErrorMessage(error));
      }
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your cart and keep shopping."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
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
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password", {
                required: "Enter your password",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          <LoadingButton type="submit" size="lg" className="w-full" loading={isLoading}>
            Log in
          </LoadingButton>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
