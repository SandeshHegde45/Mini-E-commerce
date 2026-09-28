import { Card, CardContent } from "@/components/ui/card";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex max-w-md flex-col py-6 sm:py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1.5 text-muted-foreground">{subtitle}</p>
      <Card className="mt-8">
        <CardContent>{children}</CardContent>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}
