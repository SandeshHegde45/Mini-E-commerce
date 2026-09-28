import { Link } from "react-router";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      action={<Link to="/" className={buttonVariants()}>Back to shop</Link>}
    />
  );
}
