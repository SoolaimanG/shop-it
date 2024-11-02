import { Fragment, ReactNode, useState } from "react";
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
import ManualPayment from "./manual-payment";
import { appConfigs } from "../../data";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

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
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState(0);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setOrderId("");
    }
  };

  const OrderForm = () => {
    const [formState, setFormState] = useState({
      fullName: user?.name || "",
      email: user?.email || "",
      phoneNumber: "",
      state: user?.address.state || "",
      note: "",
    });

    const { isLoading, data } = useQuery({
      queryKey: ["states"],
      queryFn: store.getStates,
    });

    const { isLoading: deliveryPriceLoading, data: __data } = useQuery({
      queryKey: ["deliveryFee", formState.state, products],
      queryFn: () =>
        store.calculateDeliveryFee(
          formState.state,
          products.map((_) => _.id)
        ),
      enabled: Boolean(formState.state),
    });

    const { data: states } = data || {};
    const { data: deliveryPrice } = __data || {};

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleStateChange = (value: string) => {
      setFormState((prev) => ({ ...prev, state: value }));
    };

    const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      const { phoneNumber, fullName: name, note, email, state } = formState;

      try {
        const res = await store.createNewOrder({
          products: products.map((product) => ({
            ids: product.id,
            color: product.color,
          })),
          address: {
            address: state,
            state,
          },
          customer: {
            email,
            phoneNumber,
            note,
            name,
          },
        });

        setOrderId(res.data._id || "");
        toast({
          title: "Order Placed Successfully",
          description:
            "An Account Number will be shown to you to make your payments.",
        });
        setAmount(res.data.totalAmount || 0);
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
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
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
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Delivery Time</AlertTitle>
          <AlertDescription>
            Note: Delivery takes up to 5-7 days depending on your location.
          </AlertDescription>
        </Alert>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-bold">
            {formatCurrency(totalPrice + (deliveryPrice?.price || 0))}
          </span>
        </div>
        <div className="flex flex-col-reverse md:flex-row gap-2">
          <Button variant={"default"} className="w-full" type="submit">
            Proceed To Payment
          </Button>
        </div>
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

  return (
    <Fragment>
      {isMobile ? <MobileSheet /> : <DesktopDialog />}
      <ManualPayment
        orderId={orderId}
        open={Boolean(orderId)}
        onOpenChange={onOpenChange}
        amount={amount}
        accounts={appConfigs.shopAccountNumbers}
      />
    </Fragment>
  );
}
