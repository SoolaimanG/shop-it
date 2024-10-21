import { toast } from "@/hooks/use-toast";
import { useStore } from "@/hooks/useStore";
import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";
import { IProduct } from "types";

export const AddToCart: FC<{
  children: ReactNode;
  product: IProduct;
  className?: string;
  quantity?: number;
  color: string;
}> = ({ children, className, product, quantity = 1, color }) => {
  const { addItemToCart } = useStore();
  //
  return (
    <div
      onClick={() => {
        Boolean(quantity) && addItemToCart({ ...product, quantity, color });
        toast({
          title: "Success",
          description: `Product ${product._id} has been added to your cart`,
        });
      }}
      className={cn(className, "")}
    >
      {children}
    </div>
  );
};
