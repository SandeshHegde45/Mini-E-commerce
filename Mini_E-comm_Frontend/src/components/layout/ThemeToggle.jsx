import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/features/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { TooltipHint } from "@/components/TooltipHint";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <TooltipHint content={label}>
      <Button variant="outline" size="icon-lg" onClick={toggleTheme} aria-label={label}>
        <Sun className="dark:hidden" />
        <Moon className="hidden dark:block" />
      </Button>
    </TooltipHint>
  );
}
