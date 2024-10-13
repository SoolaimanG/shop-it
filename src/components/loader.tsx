import { ShoppingCart } from "lucide-react";
import { FC } from "react";

export const Loader: FC<{ iconSize?: number; message?: string }> = ({
  iconSize = 20,
  message = "Loading your shopping experience...",
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <ShoppingCart
          size={iconSize}
          className="w-16 h-16 text-accent mx-auto animate-bounce"
        />
        <h2 className="text-2xl font-bold text-primary">{message}</h2>
        <p className="text-muted-foreground">
          Please wait while we prepare your personalized content.
        </p>
        <div className="flex justify-center space-x-1">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-75"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};
