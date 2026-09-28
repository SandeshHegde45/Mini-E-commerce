import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipHint } from "@/components/TooltipHint";

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  const label = visible ? "Hide password" : "Show password";

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className="pr-10" {...props} />
      <TooltipHint content={label}>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className="absolute top-0.5 right-0.5"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </TooltipHint>
    </div>
  );
}
