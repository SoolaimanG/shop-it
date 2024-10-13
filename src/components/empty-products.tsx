import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { PATHS } from "../../types";
import { FC, Fragment, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MiniFooter } from "./mini-footer";

const btn = (
  <Button asChild className="w-full flex items-center justify-center">
    <Link to={PATHS.PRODUCTS}>
      Start Shopping
      <ArrowRight className="ml-2 h-4 w-4" />
    </Link>
  </Button>
);

export const EmptyProducts: FC<{
  message?: string;
  header?: string;
  className?: string;
  children?: ReactNode;
  showFooter?: boolean;
}> = ({ message, header, className, children = btn, showFooter = true }) => {
  return (
    <Fragment>
      <main
        className={cn(
          "flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8",
          className
        )}
      >
        <div className="max-w-md w-full space-y-8 text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400" />
          <div>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">
              {header || "No orders yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {message ||
                "When you place an order, it will appear here. Start shopping and amazing products!"}
            </p>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </main>
      {showFooter && <MiniFooter />}
    </Fragment>
  );
};
