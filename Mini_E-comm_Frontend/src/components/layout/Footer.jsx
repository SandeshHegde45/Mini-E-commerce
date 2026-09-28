export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Basket — a small place to shop and sell.</p>
        <p data-tabular>© {new Date().getFullYear()} Basket</p>
      </div>
    </footer>
  );
}
