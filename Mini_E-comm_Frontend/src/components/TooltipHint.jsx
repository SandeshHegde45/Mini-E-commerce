import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// <TooltipHint content="Text"><Button /></TooltipHint>
export function TooltipHint({ content, children, side = "top" }) {
  if (!content) return children;
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  );
}
