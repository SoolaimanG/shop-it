import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Img } from "react-image";
import { useStore } from "@/hooks/useStore";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, Store } from "@/lib/utils";
import { useToastError } from "@/hooks/use-toast-error";
import { EmptyProducts } from "./empty-products";
import { BuyNow } from "./buy-now-btn";

export const Cart = () => {
  const store = new Store();
  const [isOpen, setIsOpen] = useState(false);
  const { removeItemFromCart, updateItemQuantity, cart } = useStore();

  const productIds = cart.flatMap((item) =>
    Array(item.quantity).fill(item._id)
  );

  const { data, error } = useQuery({
    queryKey: ["calculate-items-price", cart],
    queryFn: () => store.calculateItemsPrice(productIds),
  });

  useToastError(error);

  const { totalAmount: totalPrice = 0 } = data?.data || {};

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[100%] sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        {cart.length === 0 ? (
          <EmptyProducts
            showFooter={false}
            header="No Item In Cart"
            message="When you add an item to your cart, it will appear here. Start adding items and amazing products!"
          />
        ) : (
          <div className="flex-grow overflow-hidden flex flex-col">
            <ScrollArea className="flex-grow">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center py-4 border-b">
                  <Img
                    src={item.imgs[0]}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded object-cover mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Color: {item.availableColors[0]}
                    </p>
                    <div className="flex items-center mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateItemQuantity(item._id!, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateItemQuantity(item._id!, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(
                        (item.hasDiscount ? item.discountedPrice : item.price) *
                          item.quantity
                      )}
                    </p>
                    {item.hasDiscount && (
                      <p className="text-sm line-through text-muted-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-2"
                      onClick={() => removeItemFromCart(item._id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          <BuyNow id={productIds}>
            <Button className="w-full">Checkout</Button>
          </BuyNow>
        </div>
      </SheetContent>
    </Sheet>
  );
};
