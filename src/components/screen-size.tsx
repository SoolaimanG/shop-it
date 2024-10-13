import { FC } from "react";
import { cn } from "@/lib/utils";

export const ScreenSize: FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
> = ({ children, className, ...props }) => {
  return (
    <section
      {...props}
      className={cn(
        className,
        "w-full md:max-w-5xl lg:max-w-6xl m-auto p-2 md:p-0"
      )}
    >
      {children}
    </section>
  );
};
