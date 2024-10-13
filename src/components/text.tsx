import { cn } from "@/lib/utils";
import { DetailedHTMLProps, FC, HTMLAttributes } from "react";

export const Text: FC<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ className, children, ...props }) => {
  return (
    <div {...props} className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
};
