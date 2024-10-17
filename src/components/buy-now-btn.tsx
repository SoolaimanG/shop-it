"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@uidotdev/usehooks";
import { cn, errorMessageAndStatus, formatCurrency, store } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

export function BuyNow({
  totalPrice = 99.99,
  children,
  id: productIds,
  className,
}: {
  totalPrice?: number;
  children: ReactNode;
  id: string[];
  className?: string;
}) {
  const isMobile = useMediaQuery("(max-width:767px)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;

    try {
      const res = await store.createNewOrder({
        deliveryMethod: "waybill",
        productIds,
        shippingAddress: address,
        u: email,
        //fullName,
        //note,
      });

      window.open(res.data.paymentLink, "_blank");
      toast({
        title: "Order Placed Successfully",
        description: "You will be redirected to complete your payment.",
        variant: "default",
      });
    } catch (error) {
      const _error = errorMessageAndStatus(error);
      toast({
        title: `Something went wrong ${_error.status}`,
        description: _error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const OrderForm = () => (
    <form onSubmit={completeOrder} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" placeholder="John Doe" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          placeholder="123 Main St, City, Country"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          name="note"
          placeholder="Any special instructions..."
        />
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Total:</span>
        <span className="text-lg font-bold">{formatCurrency(totalPrice)}</span>
      </div>
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Make Payment"}
      </Button>
    </form>
  );

  const ScrollableContent = ({ children }: { children: React.ReactNode }) => (
    <div className="h-[calc(100vh-10rem)] overflow-y-auto pr-4 -mr-4 scrollbar-hide">
      {children}
    </div>
  );

  const MobileSheet = () => (
    <Drawer>
      <DrawerTrigger asChild className={cn(className)}>
        {children}
      </DrawerTrigger>
      <DrawerContent className="h-[90%] sm:h-[85%] p-3">
        <DrawerHeader>
          <DrawerTitle>Confirm Your Order</DrawerTitle>
        </DrawerHeader>
        <ScrollableContent>
          <div className="mt-4">
            <OrderForm />
          </div>
        </ScrollableContent>
      </DrawerContent>
    </Drawer>
  );

  const DesktopDialog = () => (
    <Dialog>
      <DialogTrigger asChild className={cn(className)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Confirm Your Order</DialogTitle>
        </DialogHeader>
        <ScrollableContent>
          <OrderForm />
        </ScrollableContent>
      </DialogContent>
    </Dialog>
  );

  return isMobile ? <MobileSheet /> : <DesktopDialog />;
}
