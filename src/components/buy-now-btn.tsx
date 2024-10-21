import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useStore } from "@/hooks/useStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

export function BuyNow({
  totalPrice = 99.99,
  children,
  products,
  className,
}: {
  totalPrice?: number;
  children: ReactNode;
  products: { color: string; id: string }[];
  className?: string;
}) {
  const { user } = useStore();
  const isMobile = useMediaQuery("(max-width:767px)");
  const [open, setOpen] = useState(false);

  const OrderForm = () => {
    const [formState, setFormState] = useState({
      fullName: user?.name || "",
      email: user?.email || "",
      phoneNumber: "",
      state: user?.address.state || "",
      lga: user?.address.lga || "",
      note: "",
    });

    const { isLoading, data } = useQuery({
      queryKey: ["states"],
      queryFn: store.getStates,
    });

    const { isLoading: lgasLoading, data: _data } = useQuery({
      queryKey: ["lgas", formState.state],
      queryFn: () => store.getLGAs(formState.state),
      enabled: Boolean(formState.state),
    });

    const { isLoading: deliveryPriceLoading, data: __data } = useQuery({
      queryKey: ["deliveryFee", formState.state, formState.lga],
      queryFn: () => store.calculateDeliveryFee(formState.state, formState.lga),
      enabled: Boolean(formState.state && formState.lga),
    });

    const { data: states } = data || {};
    const { data: lgas } = _data || {};
    const { data: deliveryPrice } = __data || {};

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleStateChange = (value: string) => {
      setFormState((prev) => ({ ...prev, state: value, lga: "" }));
    };

    const handleLGAChange = (value: string) => {
      setFormState((prev) => ({ ...prev, lga: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const {
        phoneNumber,
        fullName: name,
        note,
        email,
        state,
        lga,
      } = formState;

      try {
        const res = await store.createNewOrder({
          products: products.map((product) => ({
            ids: product.id,
            color: product.color,
          })),
          address: {
            address: state + lga,
            state,
            lga,
          },
          customer: {
            email,
            phoneNumber,
            note,
            name,
          },
        });

        window.open(res.data.paymentLink, "_blank");
        toast({
          title: "Order Placed Successfully",
          description: "You will be redirected to complete your payment.",
          variant: "default",
        });
        setOpen(false);
      } catch (error) {
        const _error = errorMessageAndStatus(error);
        toast({
          title: `Something went wrong ${_error.status}`,
          description: _error.message,
          variant: "destructive",
        });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            value={formState.fullName}
            onChange={handleInputChange}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formState.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formState.phoneNumber}
            onChange={handleInputChange}
            placeholder="+2348034938389"
            required
          />
        </div>
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700"
          >
            State
          </label>
          <Select
            disabled={isLoading}
            onValueChange={handleStateChange}
            value={formState.state}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              {states?.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="lga"
            className="block text-sm font-medium text-gray-700"
          >
            Local Government Area
          </label>
          <Select
            onValueChange={handleLGAChange}
            value={formState.lga}
            disabled={lgasLoading || !formState.state}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an LGA" />
            </SelectTrigger>
            <SelectContent>
              {formState.state &&
                lgas?.map((lga) => (
                  <SelectItem key={lga} value={lga}>
                    {lga}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700"
          >
            Note (Optional)
          </label>
          <Textarea
            id="note"
            name="note"
            value={formState.note}
            onChange={handleInputChange}
            placeholder="Any special instructions..."
          />
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between items-center">
          <span className="text-[15px]">Order:</span>
          <span className="text-[15px]">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[15px]">Delivery Fee:</span>
          {deliveryPriceLoading ? (
            "Calculating.."
          ) : (
            <span className="text-[15px]">
              {formatCurrency(deliveryPrice?.price || 0)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-bold">
            {formatCurrency(totalPrice + (deliveryPrice?.price || 0))}
          </span>
        </div>
        <Button className="w-full" type="submit">
          Make Payment
        </Button>
      </form>
    );
  };

  const ScrollableContent = ({ children }: { children: React.ReactNode }) => (
    <div className="h-[calc(100vh-10rem)] overflow-y-auto pr-4 -mr-4 scrollbar-hide">
      {children}
    </div>
  );

  const MobileSheet = () => (
    <Drawer open={open} onOpenChange={setOpen}>
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
    <Dialog open={open} onOpenChange={setOpen}>
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
