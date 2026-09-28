import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// shadcn Button + a spinner while `loading`.
export function LoadingButton({ loading = false, disabled, children, ...props }) {
  return (
    <Button disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Spinner data-icon="inline-start" />}
      {children}
    </Button>
  );
}
